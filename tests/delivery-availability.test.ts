import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, tx, requirePermission, getOrganizationSettings } = vi.hoisted(() => {
  const tx = {
    booking: { findFirst: vi.fn(), update: vi.fn() },
    bookingItem: { findMany: vi.fn(), update: vi.fn() },
    customer: { findFirst: vi.fn() },
    inventoryItem: { findMany: vi.fn(), update: vi.fn() },
    delivery: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
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

import { createDelivery, updateDelivery } from "@/services/delivery";

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

function deliveryFixture(status: string, bookingStatus: string, returnedQuantity = 0) {
  const scheduledAt = date("2026-10-09");
  return {
    id: "delivery-a",
    organizationId: "org-a",
    bookingId: "booking-a",
    customerId: "customer-a",
    address: "123 Main Street",
    scheduledAt,
    deliveredAt: status === "DELIVERED" ? scheduledAt : null,
    pickupAt: null,
    driver: null,
    vehicle: null,
    instructions: null,
    status,
    createdAt: scheduledAt,
    updatedAt: scheduledAt,
    booking: {
      id: "booking-a",
      organizationId: "org-a",
      bookingNumber: "BKG-1",
      customerId: "customer-a",
      eventDate: date("2026-10-10"),
      deliveryDate: scheduledAt,
      returnDate: date("2026-10-10"),
      status: bookingStatus,
      bookingItems: [{
        id: "booking-item-a",
        inventoryItemId: "item-a",
        quantity: 2,
        returnedQuantity,
      }],
    },
    customer: { firstName: "Taylor", lastName: "User" },
  };
}

describe("delivery schedule and stock transitions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({ id: "user-a", organizationId: "org-a" });
    getOrganizationSettings.mockResolvedValue({ localization: { timeZone: "UTC" } });
    prisma.$transaction.mockImplementation((operation: (client: typeof tx) => unknown) => operation(tx));
    tx.bookingItem.findMany.mockResolvedValue([]);
    tx.inventoryItem.findMany.mockResolvedValue([{
      id: "item-a",
      name: "Chair",
      status: "AVAILABLE",
      totalQuantity: 10,
      rentedQuantity: 0,
      damagedQuantity: 0,
    }]);
  });

  it("rejects a delivery schedule when another booking consumes the overlapping stock", async () => {
    tx.booking.findFirst.mockResolvedValue({
      ...deliveryFixture("SCHEDULED", "CONFIRMED").booking,
      delivery: null,
    });
    tx.customer.findFirst.mockResolvedValue({ id: "customer-a" });
    tx.inventoryItem.findMany.mockResolvedValue([{
      id: "item-a",
      name: "Chair",
      status: "AVAILABLE",
      totalQuantity: 2,
      rentedQuantity: 0,
      damagedQuantity: 0,
    }]);
    tx.bookingItem.findMany.mockResolvedValue([{
      inventoryItemId: "item-a",
      quantity: 2,
      returnedQuantity: 0,
      booking: {
        eventDate: date("2026-10-09"),
        deliveryDate: null,
        returnDate: date("2026-10-10"),
        status: "CONFIRMED",
        delivery: null,
      },
    }]);

    await expect(createDelivery({
      bookingId: "booking-a",
      customerId: "customer-a",
      address: "123 Main Street",
      scheduledAt: "2026-10-09T12:00:00.000Z",
    })).rejects.toThrow("Insufficient availability");

    expect(tx.delivery.create).not.toHaveBeenCalled();
  });

  it("moves physically dispatched stock from available to rented in one serializable transaction", async () => {
    tx.delivery.findFirst.mockResolvedValue(deliveryFixture("SCHEDULED", "CONFIRMED"));
    tx.delivery.update.mockResolvedValue({
      ...deliveryFixture("IN_TRANSIT", "IN_PROGRESS"),
    });

    await updateDelivery("delivery-a", { status: "IN_TRANSIT" });

    expect(tx.inventoryItem.update).toHaveBeenCalledWith({
      where: { id: "item-a", organizationId: "org-a" },
      data: {
        availableQuantity: { decrement: 2 },
        rentedQuantity: { increment: 2 },
      },
    });
    expect(tx.booking.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "booking-a", organizationId: "org-a" },
      data: { status: "IN_PROGRESS" },
    }));
    expect(prisma.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ isolationLevel: "Serializable" }),
    );
  });

  it("requires per-item return records before completing a delivery", async () => {
    tx.delivery.findFirst.mockResolvedValue(deliveryFixture("DELIVERED", "IN_PROGRESS"));

    await expect(updateDelivery("delivery-a", { status: "COMPLETED" }))
      .rejects.toThrow("Record returned quantities from the booking");

    expect(tx.delivery.update).not.toHaveBeenCalled();
    expect(tx.inventoryItem.update).not.toHaveBeenCalled();
  });

  it("completes a delivery after all item returns are recorded", async () => {
    tx.delivery.findFirst.mockResolvedValue(deliveryFixture("DELIVERED", "COMPLETED", 2));
    tx.delivery.update.mockResolvedValue(deliveryFixture("COMPLETED", "COMPLETED", 2));

    await updateDelivery("delivery-a", { status: "COMPLETED" });

    expect(tx.delivery.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "delivery-a", organizationId: "org-a" },
      data: expect.objectContaining({ status: "COMPLETED", pickupAt: expect.any(Date) }),
    }));
    expect(tx.inventoryItem.update).not.toHaveBeenCalled();
  });
});
