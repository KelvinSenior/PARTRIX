import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, requirePermission, getOrganizationSettings } = vi.hoisted(() => ({
  prisma: {
    booking: { count: vi.fn() },
    inventoryItem: { findMany: vi.fn() },
    bookingItem: { findMany: vi.fn() },
    delivery: { count: vi.fn() },
  },
  requirePermission: vi.fn(),
  getOrganizationSettings: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/permissions", () => ({ requirePermission }));
vi.mock("@/services/settings", () => ({ getOrganizationSettings }));

import { getLiveAlertCounts } from "@/services/liveAlerts";

describe("live dashboard alerts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({ organizationId: "org-a" });
    getOrganizationSettings.mockResolvedValue({ localization: { timeZone: "UTC" } });
    prisma.booking.count.mockResolvedValue(2);
    prisma.inventoryItem.findMany.mockResolvedValue([
      { id: "item-a", totalQuantity: 4, rentedQuantity: 0, damagedQuantity: 0, minimumThreshold: 0, status: "AVAILABLE" },
      { id: "item-b", totalQuantity: 4, rentedQuantity: 0, damagedQuantity: 0, minimumThreshold: 1, status: "AVAILABLE" },
      { id: "item-c", totalQuantity: 4, rentedQuantity: 0, damagedQuantity: 0, minimumThreshold: 2, status: "AVAILABLE" },
    ]);
    prisma.bookingItem.findMany.mockResolvedValue([
      {
        inventoryItemId: "item-a",
        quantity: 4,
        returnedQuantity: 0,
        booking: {
          eventDate: new Date("2026-10-28T00:00:00.000Z"),
          deliveryDate: null,
          returnDate: new Date("2026-10-28T00:00:00.000Z"),
          status: "CONFIRMED",
          delivery: null,
        },
      },
      {
        inventoryItemId: "item-b",
        quantity: 3,
        returnedQuantity: 0,
        booking: {
          eventDate: new Date("2026-10-28T00:00:00.000Z"),
          deliveryDate: null,
          returnDate: new Date("2026-10-28T00:00:00.000Z"),
          status: "CONFIRMED",
          delivery: null,
        },
      },
    ]);
    prisma.delivery.count.mockResolvedValue(3);
  });

  it("counts pending bookings, low-stock inventory, and today's open deliveries by organization", async () => {
    const alerts = await getLiveAlertCounts(new Date("2026-10-28T14:30:00.000Z"));

    expect(alerts).toEqual({
      pendingBookings: 2,
      lowStockItems: 2,
      deliveriesToday: 3,
    });
    expect(prisma.booking.count).toHaveBeenCalledWith({
      where: { organizationId: "org-a", status: "PENDING" },
    });
    expect(prisma.inventoryItem.findMany).toHaveBeenCalledWith({
      where: { organizationId: "org-a" },
      select: {
        id: true,
        totalQuantity: true,
        rentedQuantity: true,
        damagedQuantity: true,
        minimumThreshold: true,
        status: true,
      },
    });
    expect(prisma.delivery.count).toHaveBeenCalledWith({
      where: {
        organizationId: "org-a",
        status: { in: ["SCHEDULED", "IN_TRANSIT"] },
        scheduledAt: {
          gte: new Date("2026-10-28T00:00:00.000Z"),
          lt: new Date("2026-10-29T00:00:00.000Z"),
        },
      },
    });
    expect(requirePermission).toHaveBeenCalledWith("bookings:read");
    expect(requirePermission).toHaveBeenCalledWith("inventory:read");
    expect(requirePermission).toHaveBeenCalledWith("deliveries:read");
  });

  it("uses the workspace timezone when a daylight-saving transition changes today's UTC range", async () => {
    getOrganizationSettings.mockResolvedValue({
      localization: { timeZone: "America/New_York" },
    });

    await getLiveAlertCounts(new Date("2026-11-01T15:00:00.000Z"));

    expect(prisma.delivery.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        scheduledAt: {
          gte: new Date("2026-11-01T04:00:00.000Z"),
          lt: new Date("2026-11-02T05:00:00.000Z"),
        },
      }),
    });
  });
});
