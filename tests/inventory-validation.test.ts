import { describe, expect, it } from "vitest";
import { inventoryFiltersSchema } from "@/lib/inventoryValidation";

describe("inventory availability filters", () => {
  it("rejects delivery dates after the event date", () => {
    const result = inventoryFiltersSchema.safeParse({
      eventDate: "2026-10-10",
      deliveryDate: "2026-10-11",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({
        path: ["deliveryDate"],
        message: "Delivery date must be on or before the event date.",
      }));
    }
  });

  it("allows delivery on the event date", () => {
    const result = inventoryFiltersSchema.safeParse({
      eventDate: "2026-10-10",
      deliveryDate: "2026-10-10",
    });

    expect(result.success).toBe(true);
  });
});
