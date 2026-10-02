import { z } from "zod";

const damageAmount = z.number()
  .finite()
  .min(0)
  .max(9_999_999_999.99)
  .refine((amount) => Number.isInteger(amount * 100), "Use no more than two decimal places.");

export const createDamageSchema = z.object({
  bookingId: z.string().uuid().optional().nullable(),
  inventoryItemId: z.string().uuid(),
  quantity: z.number().int().min(1),
  severity: z.enum(["MINOR", "MODERATE", "SEVERE"]).optional(),
  notes: z.string().max(1000).optional().nullable(),
  missing: z.boolean().optional(),
  repairCost: damageAmount.optional().nullable(),
  customerCharge: damageAmount.optional().nullable(),
});

export const resolveDamageSchema = z.object({
  action: z.enum(["repair", "mark_lost", "none"]).optional(),
  customerCharge: damageAmount.optional().nullable(),
});

export type CreateDamageInput = z.infer<typeof createDamageSchema>;
export type ResolveDamageInput = z.infer<typeof resolveDamageSchema>;
