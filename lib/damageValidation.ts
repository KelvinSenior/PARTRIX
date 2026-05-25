import { z } from "zod";

export const createDamageSchema = z.object({
  bookingId: z.string().uuid().optional().nullable(),
  inventoryItemId: z.string(),
  quantity: z.number().int().min(1),
  severity: z.enum(["MINOR", "MODERATE", "SEVERE"]).optional(),
  notes: z.string().optional().nullable(),
  missing: z.boolean().optional(),
  repairCost: z.number().optional().nullable(),
  customerCharge: z.number().optional().nullable(),
});

export const resolveDamageSchema = z.object({
  action: z.enum(["repair", "mark_lost", "none"]).optional(),
  customerCharge: z.number().optional().nullable(),
});

export type CreateDamageInput = z.infer<typeof createDamageSchema>;
export type ResolveDamageInput = z.infer<typeof resolveDamageSchema>;
