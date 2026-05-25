import { DeliveryDTO, DeliveryStatus } from "@/types/delivery";

function generateId() {
  return 'd_' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

const store: Map<string, DeliveryDTO> = new Map();

function nowIso() {
  return new Date().toISOString();
}

export async function createDelivery(payload: any) {
  const id = generateId();
  const dto: DeliveryDTO = {
    id,
    pickupAddress: payload.pickupAddress,
    dropoffAddress: payload.dropoffAddress,
    scheduledAt: payload.scheduledAt ?? null,
    packageDetails: payload.packageDetails ?? null,
    assignedDriverId: payload.assignedDriverId ?? null,
    vehicleId: payload.vehicleId ?? null,
    status: 'PENDING' as DeliveryStatus,
    notes: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  store.set(id, dto);
  return dto;
}

export async function listDeliveries() {
  return Array.from(store.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getDelivery(id: string) {
  return store.get(id) ?? null;
}

export async function updateDelivery(id: string, patch: Partial<DeliveryDTO>) {
  const existing = store.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch, updatedAt: nowIso() };
  store.set(id, updated);
  return updated;
}

export async function updateStatus(id: string, status: DeliveryStatus) {
  const d = store.get(id);
  if (!d) return null;
  d.status = status;
  d.updatedAt = nowIso();
  store.set(id, d);
  return d;
}

export async function addNote(id: string, note: string) {
  const d = store.get(id);
  if (!d) return null;
  d.notes.push(note);
  d.updatedAt = nowIso();
  store.set(id, d);
  return d;
}
