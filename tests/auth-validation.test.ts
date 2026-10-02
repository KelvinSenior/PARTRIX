import { describe, expect, it } from "vitest";
import { signupPayloadSchema } from "@/lib/authValidation";

describe("public registration validation", () => {
  it("does not accept a workspace slug as a membership credential", () => {
    const parsed = signupPayloadSchema.safeParse({
      organizationName: "Example Rentals",
      name: "Taylor User",
      email: "taylor@example.com",
      password: "SecurePassword!42",
      organizationSlug: "another-business",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).not.toHaveProperty("organizationSlug");
  });

  it("allows invitation registration without creating another workspace", () => {
    const parsed = signupPayloadSchema.safeParse({
      invitationToken: "a".repeat(64),
      name: "Taylor User",
      email: "taylor@example.com",
      password: "SecurePassword!42",
    });

    expect(parsed.success).toBe(true);
  });
});