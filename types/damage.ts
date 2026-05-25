export type DamageSeverity = "MINOR" | "MODERATE" | "SEVERE";

export type DamageReportDTO = {
  id: string;
  bookingId?: string | null;
  inventoryItemId: string;
  inventoryItemName?: string | null;
  reportedById?: string | null;
  reportDate: string;
  quantity: number;
  severity: DamageSeverity;
  notes?: string | null;
  resolved: boolean;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateDamagePayload = {
  bookingId?: string | null;
  inventoryItemId: string;
  quantity: number;
  severity?: DamageSeverity;
  notes?: string | null;
  missing?: boolean; // if true, item considered missing/lost
  repairCost?: number | null;
  customerCharge?: number | null;
};

export type ResolveDamagePayload = {
  action?: "repair" | "mark_lost" | "none";
  customerCharge?: number | null;
};
