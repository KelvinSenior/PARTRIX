import { z } from "zod";

const monetaryAmount = z.number()
  .finite()
  .positive()
  .max(99_999_999_999.99)
  .refine((amount) => Number.isInteger(amount * 100), "Use no more than two decimal places.");

const optionalText = (maximum: number) => z.preprocess(
  (value) => value === "" ? undefined : value,
  z.string().trim().max(maximum).optional(),
);

export const paymentPayloadSchema = z.object({
  bookingId: z.string().uuid().nullable().optional(),
  amount: monetaryAmount,
  method: z.enum(["CASH", "CREDIT_CARD", "BANK_TRANSFER", "CHECK", "MOBILE_WALLET"]),
  type: z.enum(["RENTAL", "SECURITY_DEPOSIT", "REFUND"]).optional(),
  transactionReference: optionalText(160),
  notes: optionalText(1000),
}).superRefine((payload, context) => {
  if (payload.type === "REFUND" && !payload.bookingId) {
    context.addIssue({ code: "custom", path: ["bookingId"], message: "Refunds must reference a booking." });
  }
});

export const expensePayloadSchema = z.object({
  category: z.enum(["OPERATIONS", "MAINTENANCE", "PROCUREMENT", "MARKETING", "OTHER"]),
  amount: monetaryAmount,
  incurredAt: z.string().datetime({ offset: true }),
  vendor: optionalText(160),
  receiptUrl: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.string().trim().max(2048).optional(),
  ),
  bookingId: z.string().uuid().nullable().optional(),
  notes: optionalText(1000),
}).superRefine((payload, context) => {
  const incurredAt = new Date(payload.incurredAt);
  if (!Number.isFinite(incurredAt.getTime()) || incurredAt > new Date(Date.now() + 366 * 24 * 60 * 60 * 1000)) {
    context.addIssue({ code: "custom", path: ["incurredAt"], message: "Enter a valid expense date." });
  }
});

export type ValidPaymentPayload = z.infer<typeof paymentPayloadSchema>;
export type ValidExpensePayload = z.infer<typeof expensePayloadSchema>;