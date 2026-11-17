import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, requirePermission, getOrganizationSettings } = vi.hoisted(() => ({
  prisma: {
    booking: { count: vi.fn() },
    inventoryItem: { findMany: vi.fn() },
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
      { availableQuantity: 0, minimumThreshold: 0 },
      { availableQuantity: 1, minimumThreshold: 1 },
      { availableQuantity: 4, minimumThreshold: 2 },
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
      select: { availableQuantity: true, minimumThreshold: true },
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
