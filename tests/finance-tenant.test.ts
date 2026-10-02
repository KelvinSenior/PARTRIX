import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, tx, requirePermission, getOrganizationSettings } = vi.hoisted(() => {
  const tx = {
    booking: { findFirst: vi.fn(), update: vi.fn() },
    payment: { create: vi.fn() },
    expense: { create: vi.fn() },
  };
  const prisma = {
    $transaction: vi.fn(),
    payment: { findMany: vi.fn() },
    expense: { findMany: vi.fn() },
    booking: { findMany: vi.fn() },
  };
  return {
    prisma,
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

import { getFinanceSummary, recordExpense, recordPayment } from "@/services/finance";

const decimal = (value: number) => ({ toNumber: () => value, toString: () => value.toFixed(2) });

describe("financial tenant isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({ id: "user-a", role: "ADMIN", organizationId: "org-a" });
    getOrganizationSettings.mockResolvedValue({
      payment: { acceptedMethods: ["CASH"], requireTransactionReference: false },
      localization: { currency: { symbol: "$", symbolPosition: "before", decimalPlaces: 2, decimalSeparator: ".", thousandsSeparator: "," } },
    });
    tx.booking.findFirst.mockResolvedValue(null);
    tx.booking.update.mockResolvedValue({});
    tx.payment.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "payment-a",
      bookingId: data.bookingId,
      amount: decimal(Number(data.amount)),
      type: data.type,
      method: data.method,
      status: data.status,
      transactionReference: null,
      processedById: "user-a",
      processedAt: new Date("2026-09-29T00:00:00.000Z"),
      notes: null,
      createdAt: new Date("2026-09-29T00:00:00.000Z"),
      booking: { bookingNumber: "BKG-1" },
    }));
    prisma.$transaction.mockImplementation((operation: (client: typeof tx) => unknown) => operation(tx));
    prisma.payment.findMany.mockResolvedValue([]);
    prisma.expense.findMany.mockResolvedValue([]);
    prisma.booking.findMany.mockResolvedValue([]);
  });

  it("rejects payment creation for a booking outside the active organization", async () => {
    await expect(recordPayment({
      bookingId: "b09a7cd3-6d18-4c8e-8656-000000000001",
      amount: 25,
      method: "CASH",
    }, "user-a")).rejects.toThrow("Booking not found.");
    expect(tx.booking.findFirst).toHaveBeenCalledWith({
      where: { id: "b09a7cd3-6d18-4c8e-8656-000000000001", organizationId: "org-a" },
    });
    expect(tx.payment.create).not.toHaveBeenCalled();
  });

  it("rejects expense creation for a booking outside the active organization", async () => {
    await expect(recordExpense({
      bookingId: "b09a7cd3-6d18-4c8e-8656-000000000001",
      amount: 25,
      category: "OPERATIONS",
      incurredAt: "2026-09-29T00:00:00.000Z",
    }, "user-a")).rejects.toThrow("Booking not found.");
    expect(tx.booking.findFirst).toHaveBeenCalledWith({
      where: { id: "b09a7cd3-6d18-4c8e-8656-000000000001", organizationId: "org-a" },
      select: { id: true },
    });
    expect(tx.expense.create).not.toHaveBeenCalled();
  });

  it("allocates partial rental payments without reducing refundable deposit obligations", async () => {
    tx.booking.findFirst.mockResolvedValue({
      id: "booking-a",
      totalAmount: decimal(100),
      depositAmount: decimal(20),
      depositPaid: decimal(0),
      depositRefunded: decimal(0),
      balanceDue: decimal(120),
    });

    await recordPayment({ bookingId: "b09a7cd3-6d18-4c8e-8656-000000000001", amount: 50, method: "CASH" }, "user-a");

    expect(tx.booking.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "booking-a" },
      data: expect.objectContaining({ depositPaid: "0.00", balanceDue: "70.00" }),
    }));
  });

  it("excludes security deposits and refunds from rental revenue", async () => {
    prisma.payment.findMany.mockResolvedValue([{ amount: decimal(100), processedAt: new Date("2026-09-29T00:00:00.000Z") }]);
    await getFinanceSummary();

    expect(prisma.payment.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ organizationId: "org-a", type: "RENTAL", status: "COMPLETED" }),
    }));
  });
});