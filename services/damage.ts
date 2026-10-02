import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { createNotification } from "@/services/notification";
import type { DamageReportDTO, CreateDamagePayload, ResolveDamagePayload } from "@/types/damage";

function serialize(dr: any): DamageReportDTO {
  return {
    id: dr.id,
    bookingId: dr.bookingId ?? null,
    inventoryItemId: dr.inventoryItemId,
    inventoryItemName: dr.inventoryItem?.name ?? null,
    reportedById: dr.reportedById ?? null,
    reportDate: dr.reportDate.toISOString(),
    quantity: dr.quantity,
    severity: dr.severity,
    notes: dr.notes ?? null,
    resolved: dr.resolved,
    resolvedAt: dr.resolvedAt ? dr.resolvedAt.toISOString() : null,
    createdAt: dr.createdAt.toISOString(),
    updatedAt: dr.updatedAt.toISOString(),
  };
}

export async function listDamageReports() {
  const user = await requirePermission("damage:read");
  const rows = await prisma.damageReport.findMany({ where: { organizationId: user.organizationId! }, include: { inventoryItem: true } });
  return rows.map(serialize);
}

export async function getDamageReport(id: string) {
  const user = await requirePermission("damage:read");
  const row = await prisma.damageReport.findFirst({ where: { id, organizationId: user.organizationId! }, include: { inventoryItem: true } });
  return row ? serialize(row) : null;
}

export async function createDamageReport(payload: CreateDamagePayload, reportedById?: string | null) {
  const user = await requirePermission("damage:report");

  if (payload.bookingId) {
    const booking = await prisma.booking.findFirst({
      where: {
        id: payload.bookingId,
        organizationId: user.organizationId!,
        bookingItems: { some: { inventoryItemId: payload.inventoryItemId } },
      },
      select: { id: true },
    });
    if (!booking) throw new Error("Booking not found.");
  }

  // adjust inventory quantities
  const item = await prisma.inventoryItem.findFirst({ where: { id: payload.inventoryItemId, organizationId: user.organizationId! } });
  if (!item) throw new Error("Inventory item not found");

  const quantity = payload.quantity ?? 1;

  if (payload.missing) {
    // mark as lost: reduce total and available
    const newTotal = Math.max(0, item.totalQuantity - quantity);
    const newAvailable = Math.max(0, item.availableQuantity - quantity);
    await prisma.inventoryItem.update({ where: { id: item.id, organizationId: user.organizationId! }, data: { totalQuantity: newTotal, availableQuantity: newAvailable } });
  } else {
    // damaged: decrement available, increment damaged
    const newAvailable = Math.max(0, item.availableQuantity - quantity);
    const newDamaged = item.damagedQuantity + quantity;
    await prisma.inventoryItem.update({ where: { id: item.id, organizationId: user.organizationId! }, data: { availableQuantity: newAvailable, damagedQuantity: newDamaged } });
  }

  const notesExtra: any = {};
  if (payload.repairCost != null) notesExtra.repairCost = payload.repairCost;
  if (payload.customerCharge != null) notesExtra.customerCharge = payload.customerCharge;

  const dr = await prisma.damageReport.create({ data: {
    organizationId: user.organizationId!,
    bookingId: payload.bookingId ?? null,
    inventoryItemId: payload.inventoryItemId,
    reportedById: reportedById ?? null,
    quantity,
    severity: payload.severity ?? 'MINOR',
    notes: payload.notes ? payload.notes + '\n' + JSON.stringify(notesExtra) : JSON.stringify(notesExtra),
  }, include: { inventoryItem: true } });

  await createNotification({
    organizationId: user.organizationId!,
    userId: reportedById ?? user.id,
    type: "INVENTORY",
    priority: dr.severity === "SEVERE" ? "CRITICAL" : "WARNING",
    title: "Damaged item recorded",
    message: `${quantity} ${dr.inventoryItem?.name ?? "item"} marked as damaged.`,
    href: payload.bookingId ? `/bookings/${payload.bookingId}` : "/inventory",
    entity: "DamageReport",
    entityId: dr.id,
    metadata: { inventoryItemId: payload.inventoryItemId, severity: dr.severity },
  });

  return serialize(dr);
}

export async function resolveDamageReport(id: string, payload: ResolveDamagePayload) {
  const user = await requirePermission("damage:resolve");
  const dr = await prisma.damageReport.findFirst({ where: { id, organizationId: user.organizationId! } });
  if (!dr) return null;

  const item = await prisma.inventoryItem.findFirst({ where: { id: dr.inventoryItemId, organizationId: user.organizationId! } });
  if (!item) throw new Error("Inventory item not found");

  // actions: repair -> move damaged -> available; mark_lost -> decrement total & damaged
  if (payload.action === 'repair') {
    const qty = dr.quantity;
    const newDamaged = Math.max(0, item.damagedQuantity - qty);
    const newAvailable = item.availableQuantity + qty;
    await prisma.inventoryItem.update({ where: { id: item.id, organizationId: user.organizationId! }, data: { damagedQuantity: newDamaged, availableQuantity: newAvailable } });
  }

  if (payload.action === 'mark_lost') {
    const qty = dr.quantity;
    const newTotal = Math.max(0, item.totalQuantity - qty);
    const newDamaged = Math.max(0, item.damagedQuantity - qty);
    const newAvailable = Math.max(0, item.availableQuantity - qty);
    await prisma.inventoryItem.update({ where: { id: item.id, organizationId: user.organizationId! }, data: { totalQuantity: newTotal, damagedQuantity: newDamaged, availableQuantity: newAvailable } });
  }

  const chargeNote = payload.customerCharge == null
    ? null
    : `Customer charge assessed: ${payload.customerCharge.toFixed(2)}`;
  const updates: any = {
    resolved: true,
    resolvedAt: new Date(),
    ...(chargeNote ? { notes: [dr.notes, chargeNote].filter(Boolean).join("\n") } : {}),
  };
  const updated = await prisma.damageReport.update({ where: { id, organizationId: user.organizationId! }, data: updates, include: { inventoryItem: true } });

  await createNotification({
    organizationId: user.organizationId!,
    userId: user.id,
    type: "INVENTORY",
    priority: "SUCCESS",
    title: "Damage resolved",
    message: `${updated.inventoryItem?.name ?? "Damaged item"} was resolved.`,
    href: dr.bookingId ? `/bookings/${dr.bookingId}` : "/inventory",
    entity: "DamageReport",
    entityId: updated.id,
    metadata: { action: payload.action },
  });

  return serialize(updated);
}
