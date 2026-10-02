import { describe, expect, it } from "vitest";
import { expensePayloadSchema, paymentPayloadSchema } from "@/lib/financeValidation";

describe("financial request validation", () => {
  it("rejects negative and over-precision payment amounts", () => {
    const base = { method: "CASH", bookingId: null };
    expect(paymentPayloadSchema.safeParse({ ...base, amount: -1 }).success).toBe(false);
    expect(paymentPayloadSchema.safeParse({ ...base, amount: 1.239 }).success).toBe(false);
  });

  it("requires a booking for refunds and rejects unsupported payment methods", () => {
    expect(paymentPayloadSchema.safeParse({ amount: 1, method: "CASH", type: "REFUND" }).success).toBe(false);
    expect(paymentPayloadSchema.safeParse({ amount: 1, method: "CRYPTO" }).success).toBe(false);
  });

  it("rejects invalid dates and amounts for expenses", () => {
    const parsed = expensePayloadSchema.safeParse({
      category: "OPERATIONS",
      amount: 10,
      incurredAt: "not-a-date",
    });
    expect(parsed.success).toBe(false);
    expect(expensePayloadSchema.safeParse({
      category: "OPERATIONS",
      amount: 0,
      incurredAt: "2026-09-29T00:00:00.000Z",
    }).success).toBe(false);
  });
});