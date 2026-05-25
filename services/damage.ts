import { prisma } from "@/lib/prisma";
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
  const rows = await prisma.damageReport.findMany({ include: { inventoryItem: true } });
  return rows.map(serialize);
}

export async function getDamageReport(id: string) {
  const row = await prisma.damageReport.findUnique({ where: { id }, include: { inventoryItem: true } });
  return row ? serialize(row) : null;
}

export async function createDamageReport(payload: CreateDamagePayload, reportedById?: string | null) {
  // adjust inventory quantities
  const item = await prisma.inventoryItem.findUnique({ where: { id: payload.inventoryItemId } });
  if (!item) throw new Error("Inventory item not found");

  const quantity = payload.quantity ?? 1;

  if (payload.missing) {
    // mark as lost: reduce total and available
    const newTotal = Math.max(0, item.totalQuantity - quantity);
    const newAvailable = Math.max(0, item.availableQuantity - quantity);
    await prisma.inventoryItem.update({ where: { id: item.id }, data: { totalQuantity: newTotal, availableQuantity: newAvailable } });
  } else {
    // damaged: decrement available, increment damaged
    const newAvailable = Math.max(0, item.availableQuantity - quantity);
    const newDamaged = item.damagedQuantity + quantity;
    await prisma.inventoryItem.update({ where: { id: item.id }, data: { availableQuantity: newAvailable, damagedQuantity: newDamaged } });
  }

  const notesExtra: any = {};
  if (payload.repairCost != null) notesExtra.repairCost = payload.repairCost;
  if (payload.customerCharge != null) notesExtra.customerCharge = payload.customerCharge;

  const dr = await prisma.damageReport.create({ data: {
    bookingId: payload.bookingId ?? null,
    inventoryItemId: payload.inventoryItemId,
    reportedById: reportedById ?? null,
    quantity,
    severity: payload.severity ?? 'MINOR',
    notes: payload.notes ? payload.notes + '\n' + JSON.stringify(notesExtra) : JSON.stringify(notesExtra),
  }, include: { inventoryItem: true } });

  // if customer charge provided and booking exists, create a Payment record as a charge
  if (payload.customerCharge && payload.bookingId) {
    await prisma.payment.create({ data: {
      bookingId: payload.bookingId,
      amount: payload.customerCharge as any,
      method: 'CASH',
      status: 'COMPLETED',
      processedAt: new Date(),
    } });
  }

  return serialize(dr);
}

export async function resolveDamageReport(id: string, payload: ResolveDamagePayload) {
  const dr = await prisma.damageReport.findUnique({ where: { id } });
  if (!dr) return null;

  const item = await prisma.inventoryItem.findUnique({ where: { id: dr.inventoryItemId } });
  if (!item) throw new Error("Inventory item not found");

  // actions: repair -> move damaged -> available; mark_lost -> decrement total & damaged
  if (payload.action === 'repair') {
    const qty = dr.quantity;
    const newDamaged = Math.max(0, item.damagedQuantity - qty);
    const newAvailable = item.availableQuantity + qty;
    await prisma.inventoryItem.update({ where: { id: item.id }, data: { damagedQuantity: newDamaged, availableQuantity: newAvailable } });
  }

  if (payload.action === 'mark_lost') {
    const qty = dr.quantity;
    const newTotal = Math.max(0, item.totalQuantity - qty);
    const newDamaged = Math.max(0, item.damagedQuantity - qty);
    const newAvailable = Math.max(0, item.availableQuantity - qty);
    await prisma.inventoryItem.update({ where: { id: item.id }, data: { totalQuantity: newTotal, damagedQuantity: newDamaged, availableQuantity: newAvailable } });
  }

  const updates: any = { resolved: true, resolvedAt: new Date() };
  const updated = await prisma.damageReport.update({ where: { id }, data: updates, include: { inventoryItem: true } });

  // optionally create a payment charge referenced to booking
  if (payload.customerCharge && dr.bookingId) {
    await prisma.payment.create({ data: {
      bookingId: dr.bookingId,
      amount: payload.customerCharge as any,
      method: 'CASH',
      status: 'COMPLETED',
      processedAt: new Date(),
    } });
  }

  return serialize(updated);
}
