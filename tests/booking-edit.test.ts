import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, tx, requirePermission, getOrganizationSettings } = vi.hoisted(() => {
  const tx = {
    booking: { findFirst: vi.fn(), update: vi.fn(), create: vi.fn() },
    bookingItem: { findMany: vi.fn(), update: vi.fn(), delete: vi.fn(), create: vi.fn() },
    customer: { findFirst: vi.fn() },
    inventoryItem: { findMany: vi.fn(), update: vi.fn() },
    payment: { create: vi.fn() },
    damageReport: { create: vi.fn() },
    delivery: { updateMany: vi.fn() },
  };
  return {
    prisma: { $transaction: vi.fn() },
    tx,
    requirePermission: vi.fn(),
    getOrganizationSettings: vi.fn(),
  };
});

vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/permissions", () => ({ requirePermission }));
vi.mock("@/services/settings", () => ({ getOrganizationSettings }));
vi.mock("@/services/audit", () => ({ logActivity: vi.fn() }));
vi.mock("@/services/notification", () => ({ createNotification: vi.fn() }));

import { createBooking, returnBookingItems, updateBookingItems, updateBookingStatus } from "@/services/booking";
import { bookingMoneySchema, bookingPayloadSchema } from "@/lib/bookingValidation";

const decimal = (value: number) => ({ toString: () => value.toFixed(2), toNumber: () => value });
let existingBooking: ReturnType<typeof createBookingFixture>;

function createBookingFixture(quantity: number) {
  const now = new Date("2026-09-29T00:00:00.000Z");
  const booking = {
    id: "booking-a",
    organizationId: "org-a",
    bookingNumber: "BKG-1",
    customerId: "customer-a",
    customer: { id: "customer-a", firstName: "Taylor", lastName: "User", email: null, phone: null, company: null, address: null },
    eventDate: now,
    deliveryDate: null,
    returnDate: now,
    status: "PENDING",
    notes: null,
    deliveryFee: decimal(0),
    setupFee: decimal(0),
    discount: decimal(0),
    totalAmount: decimal(quantity * 10),
    depositAmount: decimal(quantity * 2),
    depositPaid: decimal(0),
    depositRefunded: decimal(0),
    depositStatus: "PENDING",
    refundStatus: "NONE",
    balanceDue: decimal(quantity * 12),
    createdAt: now,
    updatedAt: now,
    bookingItems: [{
      id: "booking-item-a",
      inventoryItemId: "item-a",
      quantity,
      returnedQuantity: 0,
      unitPrice: decimal(10),
      discount: decimal(0),
      notes: null,
    }],
  };
  const inventoryItem = { id: "item-a", name: "Chair", status: "AVAILABLE", totalQuantity: 10, unitPrice: decimal(10) };
  tx.booking.findFirst.mockResolvedValue(booking);
  tx.inventoryItem.findMany.mockResolvedValue([inventoryItem]);
  tx.bookingItem.findMany.mockResolvedValue([]);
  tx.booking.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
    ...booking,
    ...data,
    bookingItems: [{ ...booking.bookingItems[0], quantity, inventoryItem: { name: "Chair" } }],
  }));
  prisma.$transaction.mockImplementation((operation: (client: typeof tx) => unknown) => operation(tx));
  return booking;
}

describe("booking item reservation edits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({ id: "user-a", role: "ADMIN", organizationId: "org-a" });
    getOrganizationSettings.mockResolvedValue({
      deposit: { requiredDepositPercent: 20 },
      payment: { acceptedMethods: ["CASH", "CREDIT_CARD"], requireTransactionReference: false },
      rental: { allowPartialReturns: true },
      localization: { timeZone: "UTC" },
    });
    existingBooking = createBookingFixture(2);
  });

  it("uses the default deposit when no override is provided and records the creator", async () => {
    const bookingCreate = {
      id: "booking-new",
      bookingNumber: "BKG-NEW",
      customer: { id: "customer-a", firstName: "Taylor", lastName: "User", email: null, phone: null, company: null, address: null },
      bookingItems: [],
      eventDate: new Date("2026-10-09T00:00:00.000Z"),
      deliveryDate: null,
      returnDate: null,
      status: "PENDING",
      notes: null,
      deliveryFee: decimal(0),
      setupFee: decimal(0),
      discount: decimal(0),
      totalAmount: decimal(20),
      depositAmount: decimal(4),
      depositPaid: decimal(0),
      depositRefunded: decimal(0),
      depositStatus: "PENDING",
      refundStatus: "NONE",
      balanceDue: decimal(24),
      createdAt: new Date("2026-10-09T00:00:00.000Z"),
      updatedAt: new Date("2026-10-09T00:00:00.000Z"),
    };
    tx.customer.findFirst.mockResolvedValue(null);
    tx.inventoryItem.findMany.mockResolvedValue([
      { id: "item-a", name: "Chair", status: "AVAILABLE", totalQuantity: 10, unitPrice: decimal(10) },
    ]);
    tx.booking.create.mockResolvedValue(bookingCreate);

    await createBooking({
      customer: { firstName: "Taylor", lastName: "User", email: "taylor@example.com" },
      eventDate: "2026-10-09",
      status: "PENDING",
      items: [{ inventoryItemId: "item-a", quantity: 2, discount: 0 }],
      deliveryFee: 0,
      setupFee: 0,
      discount: 0,
      returnDate: null,
      deliveryDate: null,
    });

    expect(tx.booking.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        createdBy: { connect: { id: "user-a" } },
        totalAmount: "20",
        depositAmount: "4",
        balanceDue: "24",
      }),
    }));
  });

  it("creates a confirmed booking only when an initial payment is recorded", () => {
    const basePayload = {
      customer: { firstName: "Taylor", lastName: "User" },
      eventDate: "2026-10-09",
      status: "CONFIRMED" as const,
      items: [{ inventoryItemId: "123e4567-e89b-12d3-a456-426614174000", quantity: 1, discount: 0 }],
      deliveryFee: 0,
      setupFee: 0,
      discount: 0,
    };

    expect(bookingPayloadSchema.safeParse(basePayload).success).toBe(false);
    expect(bookingPayloadSchema.safeParse({
      ...basePayload,
      initialPayment: { amount: 10, method: "CASH", type: "RENTAL" },
    }).success).toBe(true);
  });

  it("rejects a booking when the selected dates overlap another tenant booking allocation", async () => {
    tx.customer.findFirst.mockResolvedValue(null);
    tx.inventoryItem.findMany.mockResolvedValue([
      { id: "item-a", name: "Chair", status: "AVAILABLE", totalQuantity: 2, unitPrice: decimal(10) },
    ]);
    tx.bookingItem.findMany.mockResolvedValue([{
      inventoryItemId: "item-a",
      quantity: 2,
      returnedQuantity: 0,
      booking: {
        eventDate: new Date("2026-10-09T00:00:00.000Z"),
        deliveryDate: null,
        returnDate: new Date("2026-10-09T00:00:00.000Z"),
        status: "CONFIRMED",
        delivery: null,
      },
    }]);

    await expect(createBooking({
      customer: { firstName: "Taylor" },
      eventDate: "2026-10-09",
      returnDate: "2026-10-09",
      status: "PENDING",
      items: [{ inventoryItemId: "item-a", quantity: 1, discount: 0 }],
      deliveryFee: 0,
      setupFee: 0,
      discount: 0,
    })).rejects.toThrow("Only 0 unit(s) are available");

    expect(tx.booking.create).not.toHaveBeenCalled();
  });

  it("allows a new customer without a last name", () => {
    const result = bookingPayloadSchema.safeParse({
      customer: { firstName: "Taylor" },
      eventDate: "2026-10-09",
      status: "PENDING",
      items: [{ inventoryItemId: "123e4567-e89b-12d3-a456-426614174000", quantity: 1, discount: 0 }],
      deliveryFee: 0,
      setupFee: 0,
      discount: 0,
    });

    expect(result.success).toBe(true);
  });

  it("prices each inclusive rental day and uses a custom refundable deposit", async () => {
    tx.customer.findFirst.mockResolvedValue(null);
    tx.inventoryItem.findMany.mockResolvedValue([
      { id: "item-a", name: "Chair", status: "AVAILABLE", totalQuantity: 10, unitPrice: decimal(10) },
    ]);
    tx.booking.create.mockResolvedValue({
      id: "booking-multiday",
      bookingNumber: "BKG-MULTIDAY",
      customer: { id: "customer-a", firstName: "Taylor", lastName: "", email: null, phone: null, company: null, address: null },
      bookingItems: [],
      eventDate: new Date("2026-10-09T00:00:00.000Z"),
      deliveryDate: null,
      returnDate: new Date("2026-10-11T00:00:00.000Z"),
      status: "PENDING",
      notes: null,
      deliveryFee: decimal(0),
      setupFee: decimal(0),
      discount: decimal(0),
      totalAmount: decimal(60),
      depositAmount: decimal(7.5),
      depositPaid: decimal(0),
      depositRefunded: decimal(0),
      depositStatus: "PENDING",
      refundStatus: "NONE",
      balanceDue: decimal(67.5),
      createdAt: new Date("2026-10-09T00:00:00.000Z"),
      updatedAt: new Date("2026-10-09T00:00:00.000Z"),
    });

    await createBooking({
      customer: { firstName: "Taylor" },
      eventDate: "2026-10-09",
      returnDate: "2026-10-11",
      status: "PENDING",
      items: [{ inventoryItemId: "item-a", quantity: 2, discount: 0 }],
      deliveryFee: 0,
      setupFee: 0,
      discount: 0,
      depositAmount: 7.5,
    });

    expect(tx.booking.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        totalAmount: "60",
        depositAmount: "7.5",
        balanceDue: "67.5",
        bookingItems: {
          create: [expect.objectContaining({ unitPrice: "10.00", totalPrice: 60 })],
        },
      }),
    }));
  });

  it("records the initial payment and applies it to the booking balance atomically", async () => {
    const bookingCreate = {
      id: "booking-paid",
      bookingNumber: "BKG-PAID",
      customer: { id: "customer-a", firstName: "Taylor", lastName: "User", email: null, phone: null, company: null, address: null },
      bookingItems: [],
      eventDate: new Date("2026-10-09T00:00:00.000Z"),
      deliveryDate: null,
      returnDate: null,
      status: "CONFIRMED",
      notes: null,
      deliveryFee: decimal(0),
      setupFee: decimal(0),
      discount: decimal(0),
      totalAmount: decimal(20),
      depositAmount: decimal(4),
      depositPaid: decimal(0),
      depositRefunded: decimal(0),
      depositStatus: "PENDING",
      refundStatus: "NONE",
      balanceDue: decimal(24),
      createdAt: new Date("2026-10-09T00:00:00.000Z"),
      updatedAt: new Date("2026-10-09T00:00:00.000Z"),
    };
    tx.customer.findFirst.mockResolvedValue(null);
    tx.inventoryItem.findMany.mockResolvedValue([
      { id: "item-a", name: "Chair", status: "AVAILABLE", totalQuantity: 10, unitPrice: decimal(10) },
    ]);
    tx.booking.create.mockResolvedValue(bookingCreate);
    tx.payment.create.mockResolvedValue({ id: "payment-a" });

    await createBooking({
      customer: { firstName: "Taylor", lastName: "User" },
      eventDate: "2026-10-09",
      status: "CONFIRMED",
      items: [{ inventoryItemId: "item-a", quantity: 2, discount: 0 }],
      deliveryFee: 0,
      setupFee: 0,
      discount: 0,
      initialPayment: { amount: 10, method: "CASH", type: "RENTAL" },
    });

    expect(tx.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: "org-a",
        bookingId: "booking-paid",
        amount: "10.00",
        method: "CASH",
        type: "RENTAL",
        status: "COMPLETED",
        processedById: "user-a",
      }),
    });
    expect(tx.booking.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        depositPaid: "0.00",
        depositStatus: "PENDING",
        balanceDue: "14.00",
      }),
    }));
  });

  it("validates the full requested quantity for an edited date range without changing physical stock", async () => {
    await updateBookingItems("booking-a", {
      items: [{ bookingItemId: "booking-item-a", inventoryItemId: "item-a", quantity: 4 }],
    });
    expect(tx.bookingItem.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        organizationId: "org-a",
        booking: expect.objectContaining({ organizationId: "org-a" }),
      }),
    }));
    expect(tx.inventoryItem.update).not.toHaveBeenCalled();
    expect(tx.booking.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ totalAmount: "40.00", depositAmount: "8.00", balanceDue: "48.00" }),
    }));
  });

  it("rejects booking amounts that exceed Decimal(12,2) or contain fractional cents", () => {
    expect(bookingMoneySchema.safeParse(9_999_999_999.99).success).toBe(true);
    expect(bookingMoneySchema.safeParse(10_000_000_000).success).toBe(false);
    expect(bookingMoneySchema.safeParse(1.239).success).toBe(false);
  });

  it("does not change physical stock when a scheduled reservation quantity decreases", async () => {
    await updateBookingItems("booking-a", {
      items: [{ bookingItemId: "booking-item-a", inventoryItemId: "item-a", quantity: 1 }],
    });
    expect(tx.inventoryItem.update).not.toHaveBeenCalled();
  });

  it("releases the old scheduled item and reserves the replacement without changing physical stock", async () => {
    tx.inventoryItem.findMany.mockResolvedValue([
      { id: "item-a", name: "Chair", status: "AVAILABLE", totalQuantity: 10, unitPrice: decimal(10) },
      { id: "item-b", name: "Table", status: "AVAILABLE", totalQuantity: 8, unitPrice: decimal(20) },
    ]);

    await updateBookingItems("booking-a", {
      items: [{ bookingItemId: "booking-item-a", inventoryItemId: "item-b", quantity: 3 }],
    });

    expect(tx.inventoryItem.update).not.toHaveBeenCalled();
    expect(tx.bookingItem.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "booking-item-a", organizationId: "org-a" },
      data: expect.objectContaining({ inventoryItemId: "item-b", unitPrice: "20.00", totalPrice: "60.00" }),
    }));
  });

  it("retries serialization conflicts using Serializable isolation", async () => {
    const serializationConflict = Object.assign(new Error("serialization conflict"), { code: "P2034" });
    prisma.$transaction.mockRejectedValueOnce(serializationConflict);
    prisma.$transaction.mockImplementationOnce((operation: (client: typeof tx) => unknown) => operation(tx));

    await updateBookingItems("booking-a", {
      items: [{ bookingItemId: "booking-item-a", inventoryItemId: "item-a", quantity: 3 }],
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(prisma.$transaction).toHaveBeenLastCalledWith(expect.any(Function), expect.objectContaining({ isolationLevel: "Serializable" }));
  });

  it("rechecks stock before reopening a completed booking", async () => {
    const completedBooking = {
      ...existingBooking,
      status: "COMPLETED",
      bookingItems: [{
        id: "booking-item-a",
        inventoryItemId: "item-a",
        quantity: 2,
        returnedQuantity: 2,
      }],
    };
    tx.booking.findFirst.mockResolvedValue(completedBooking);
    tx.inventoryItem.findMany.mockResolvedValue([
      { id: "item-a", name: "Chair", status: "AVAILABLE", totalQuantity: 10, unitPrice: decimal(10) },
    ]);
    tx.bookingItem.findMany.mockResolvedValue([]);

    await updateBookingStatus("booking-a", "PENDING");

    expect(tx.bookingItem.update).toHaveBeenCalledWith({
      where: { id: "booking-item-a", organizationId: "org-a" },
      data: { returnedQuantity: 0 },
    });
    expect(tx.inventoryItem.update).not.toHaveBeenCalled();
  });

  it("records damaged quantities as damage reports when returned from physical rental", async () => {
    const inProgressBooking = {
      ...existingBooking,
      status: "IN_PROGRESS",
      bookingItems: [{
        id: "booking-item-a",
        inventoryItemId: "item-a",
        quantity: 2,
        returnedQuantity: 0,
      }],
      delivery: null,
    };
    tx.booking.findFirst.mockResolvedValue(inProgressBooking);
    tx.bookingItem.findMany.mockResolvedValue([{
      ...inProgressBooking.bookingItems[0],
      returnedQuantity: 1,
      inventoryItem: { name: "Chair" },
    }]);

    await returnBookingItems("booking-a", {
      returnItems: [{ bookingItemId: "booking-item-a", quantity: 1, damagedQuantity: 1 }],
    });

    expect(tx.inventoryItem.update).toHaveBeenCalledWith({
      where: { id: "item-a", organizationId: "org-a" },
      data: {
        availableQuantity: { increment: 0 },
        rentedQuantity: { decrement: 1 },
        damagedQuantity: { increment: 1 },
      },
    });
    expect(tx.damageReport.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: "org-a",
        bookingId: "booking-a",
        inventoryItemId: "item-a",
        quantity: 1,
        severity: "MINOR",
      }),
    });
  });

  it("does not complete or cancel a booking while physical items remain unreturned", async () => {
    const inProgressBooking = {
      ...existingBooking,
      status: "IN_PROGRESS",
      bookingItems: [{
        id: "booking-item-a",
        inventoryItemId: "item-a",
        quantity: 2,
        returnedQuantity: 0,
      }],
      delivery: null,
    };
    tx.booking.findFirst.mockResolvedValue(inProgressBooking);

    await expect(updateBookingStatus("booking-a", "COMPLETED"))
      .rejects.toThrow("Record all item returns");
    await expect(updateBookingStatus("booking-a", "CANCELLED"))
      .rejects.toThrow("Record the actual return");

    expect(tx.booking.update).not.toHaveBeenCalled();
    expect(tx.inventoryItem.update).not.toHaveBeenCalled();
  });
});