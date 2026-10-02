import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, tx, requirePermission, getOrganizationSettings } = vi.hoisted(() => {
  const tx = {
    booking: { findFirst: vi.fn(), update: vi.fn() },
    bookingItem: { findMany: vi.fn(), update: vi.fn(), delete: vi.fn(), create: vi.fn() },
    inventoryItem: { findMany: vi.fn(), update: vi.fn() },
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

import { updateBookingItems, updateBookingStatus } from "@/services/booking";

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
    returnDate: new Date("2026-10-01T00:00:00.000Z"),
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
    getOrganizationSettings.mockResolvedValue({ deposit: { requiredDepositPercent: 20 } });
    existingBooking = createBookingFixture(2);
  });

  it("reserves only the increased quantity", async () => {
    await updateBookingItems("booking-a", {
      items: [{ bookingItemId: "booking-item-a", inventoryItemId: "item-a", quantity: 4 }],
    });
    expect(tx.inventoryItem.update).toHaveBeenCalledWith({
      where: { id: "item-a" },
      data: { availableQuantity: { decrement: 2 }, rentedQuantity: { increment: 2 } },
    });
    expect(tx.booking.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ totalAmount: "40.00", depositAmount: "8.00", balanceDue: "48.00" }),
    }));
  });

  it("releases stock when quantity decreases", async () => {
    await updateBookingItems("booking-a", {
      items: [{ bookingItemId: "booking-item-a", inventoryItemId: "item-a", quantity: 1 }],
    });
    expect(tx.inventoryItem.update).toHaveBeenCalledWith({
      where: { id: "item-a" },
      data: { availableQuantity: { decrement: -1 }, rentedQuantity: { increment: -1 } },
    });
  });

  it("releases the old item and reserves the replacement item", async () => {
    tx.inventoryItem.findMany.mockResolvedValue([
      { id: "item-a", name: "Chair", status: "AVAILABLE", totalQuantity: 10, unitPrice: decimal(10) },
      { id: "item-b", name: "Table", status: "AVAILABLE", totalQuantity: 8, unitPrice: decimal(20) },
    ]);

    await updateBookingItems("booking-a", {
      items: [{ bookingItemId: "booking-item-a", inventoryItemId: "item-b", quantity: 3 }],
    });

    expect(tx.inventoryItem.update).toHaveBeenNthCalledWith(1, {
      where: { id: "item-a" },
      data: { availableQuantity: { decrement: -2 }, rentedQuantity: { increment: -2 } },
    });
    expect(tx.inventoryItem.update).toHaveBeenNthCalledWith(2, {
      where: { id: "item-b" },
      data: { availableQuantity: { decrement: 3 }, rentedQuantity: { increment: 3 } },
    });
    expect(tx.bookingItem.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "booking-item-a" },
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
      where: { id: "booking-item-a" },
      data: { returnedQuantity: 0 },
    });
    expect(tx.inventoryItem.update).toHaveBeenCalledWith({
      where: { id: "item-a" },
      data: { availableQuantity: { decrement: 2 }, rentedQuantity: { increment: 2 } },
    });
  });
});