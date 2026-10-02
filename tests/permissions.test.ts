import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireOrganizationContext } = vi.hoisted(() => ({
  requireOrganizationContext: vi.fn(),
}));

vi.mock("@/lib/tenant", () => ({ requireOrganizationContext }));

import { hasPermission, requirePermission } from "@/lib/permissions";
import { getMobileNavItemsForRole } from "@/lib/navConfig";

describe("role permission policy", () => {
  beforeEach(() => vi.clearAllMocks());

  it("limits financial reads and workspace management to authorized roles", () => {
    expect(hasPermission("ADMIN", "finance:read")).toBe(true);
    expect(hasPermission("MANAGER", "finance:read")).toBe(true);
    expect(hasPermission("STAFF", "finance:read")).toBe(false);
    expect(hasPermission("MANAGER", "members:manage")).toBe(false);
    expect(hasPermission("ADMIN", "members:manage")).toBe(true);
  });

  it("only includes Finance in the mobile navigation for roles with finance read access", () => {
    expect(getMobileNavItemsForRole("STAFF").some((item) => item.href === "/finance")).toBe(false);
    expect(getMobileNavItemsForRole("MANAGER").some((item) => item.href === "/finance")).toBe(true);
  });

  it("denies restricted service actions after resolving the current membership", async () => {
    requireOrganizationContext.mockResolvedValue({ organizationId: "org-a", role: "STAFF" });
    await expect(requirePermission("finance:read")).rejects.toThrow("You do not have permission");
    expect(requireOrganizationContext).toHaveBeenCalledOnce();
  });
});