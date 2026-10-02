import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, requirePermission } = vi.hoisted(() => ({
  prisma: { booking: { findMany: vi.fn() } },
  requirePermission: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/permissions", () => ({ requirePermission }));

import { getCustomerAnalytics } from "@/services/customer";

const decimal = (value: number) => ({
  toNumber: () => value,
  toString: () => value.toFixed(2),
});

describe("customer finance analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({ id: "user-a", role: "ADMIN", organizationId: "org-a" });
  });

  it("aggregates monetary values in cents and scopes bookings to the active organization", async () => {
    prisma.booking.findMany.mockResolvedValue([
      {
        totalAmount: decimal(0.1),
        balanceDue: decimal(0.1),
        payments: [
          { amount: decimal(0.2), type: "RENTAL" },
          { amount: decimal(0.1), type: "REFUND" },
        ],
      },
      {
        totalAmount: decimal(0.2),
        balanceDue: decimal(0.2),
        payments: [{ amount: decimal(0.2), type: "RENTAL" }],
      },
    ]);

    await expect(getCustomerAnalytics("customer-a")).resolves.toMatchObject({
      totalBookings: 2,
      totalRevenue: 0.3,
      totalPaid: 0.3,
      totalOutstanding: 0.3,
      avgOrderValue: 0.15,
    });
    expect(prisma.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { customerId: "customer-a", organizationId: "org-a" },
    }));
  });
});