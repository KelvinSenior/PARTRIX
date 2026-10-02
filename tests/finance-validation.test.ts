import { describe, expect, it } from "vitest";
import { expensePayloadSchema, parseFinanceDateRange, paymentPayloadSchema } from "@/lib/financeValidation";

describe("financial request validation", () => {
  it("rejects negative and over-precision payment amounts", () => {
    const base = { method: "CASH", bookingId: null };
    expect(paymentPayloadSchema.safeParse({ ...base, amount: -1 }).success).toBe(false);
    expect(paymentPayloadSchema.safeParse({ ...base, amount: 1.239 }).success).toBe(false);
    expect(paymentPayloadSchema.safeParse({ ...base, amount: 10_000_000_000 }).success).toBe(false);
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

  it("rejects invalid or reversed finance date filters", () => {
    expect(parseFinanceDateRange("not-a-date", undefined).success).toBe(false);
    expect(parseFinanceDateRange("2026-10-02", "2026-10-01").success).toBe(false);
  });

  it("includes the entire final day for date-only finance filters", () => {
    const range = parseFinanceDateRange("2026-10-01", "2026-10-01");
    expect(range.success).toBe(true);
    if (range.success) {
      expect(range.start?.toISOString()).toBe("2026-10-01T00:00:00.000Z");
      expect(range.end?.toISOString()).toBe("2026-10-01T23:59:59.999Z");
    }
  });
});