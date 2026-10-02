import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, requirePermission } = vi.hoisted(() => ({
  prisma: {
    booking: { findFirst: vi.fn() },
    inventoryItem: { findFirst: vi.fn(), update: vi.fn() },
    damageReport: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    payment: { create: vi.fn() },
  },
  requirePermission: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/permissions", () => ({ requirePermission }));
vi.mock("@/services/notification", () => ({ createNotification: vi.fn() }));

import { createDamageReport, resolveDamageReport } from "@/services/damage";
import { createDamageSchema, resolveDamageSchema } from "@/lib/damageValidation";

const now = new Date("2026-10-01T00:00:00.000Z");
const inventoryItem = {
  id: "item-a",
  name: "Camera",
  totalQuantity: 5,
  availableQuantity: 4,
  damagedQuantity: 0,
};
const damageReport = {
  id: "damage-a",
  organizationId: "org-a",
  bookingId: "booking-a",
  inventoryItemId: "item-a",
  inventoryItem,
  reportedById: "user-a",
  reportDate: now,
  quantity: 1,
  severity: "MINOR",
  notes: "Existing notes",
  resolved: false,
  resolvedAt: null,
  createdAt: now,
  updatedAt: now,
};

describe("damage charge assessments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({ id: "user-a", organizationId: "org-a", role: "ADMIN" });
    prisma.booking.findFirst.mockResolvedValue({ id: "booking-a" });
    prisma.inventoryItem.findFirst.mockResolvedValue(inventoryItem);
    prisma.inventoryItem.update.mockResolvedValue(inventoryItem);
    prisma.damageReport.create.mockResolvedValue(damageReport);
    prisma.damageReport.findFirst.mockResolvedValue(damageReport);
    prisma.damageReport.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      ...damageReport,
      ...data,
      inventoryItem,
    }));
  });

  it("does not record an assessed damage amount as a collected payment", async () => {
    await createDamageReport({
      bookingId: "booking-a",
      inventoryItemId: "item-a",
      quantity: 1,
      customerCharge: 25.5,
    }, "user-a");

    expect(prisma.damageReport.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ notes: expect.stringContaining('"customerCharge":25.5') }),
    }));
    expect(prisma.payment.create).not.toHaveBeenCalled();
  });

  it("preserves a resolution assessment without inserting a payment", async () => {
    await resolveDamageReport("damage-a", { action: "none", customerCharge: 12.75 });

    expect(prisma.damageReport.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ notes: "Existing notes\nCustomer charge assessed: 12.75" }),
    }));
    expect(prisma.payment.create).not.toHaveBeenCalled();
  });

  it("rejects malformed inventory IDs and invalid monetary precision", () => {
    expect(createDamageSchema.safeParse({ inventoryItemId: "not-a-uuid", quantity: 1 }).success).toBe(false);
    expect(resolveDamageSchema.safeParse({ customerCharge: -1 }).success).toBe(false);
    expect(resolveDamageSchema.safeParse({ customerCharge: 1.239 }).success).toBe(false);
  });
});