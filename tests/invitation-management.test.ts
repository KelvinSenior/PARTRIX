import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, requirePermission } = vi.hoisted(() => ({
  prisma: { organizationInvitation: { updateMany: vi.fn() } },
  requirePermission: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/permissions", () => ({ requirePermission }));

import { revokeInvitation } from "@/services/invitation";

describe("revoke organization invitation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({ id: "user-a", organizationId: "org-a" });
    prisma.organizationInvitation.updateMany.mockResolvedValue({ count: 1 });
  });

  it("allows expired unaccepted invitations to be revoked", async () => {
    await expect(revokeInvitation("invitation-a")).resolves.toBe(true);

    expect(prisma.organizationInvitation.updateMany).toHaveBeenCalledWith({
      where: {
        id: "invitation-a",
        organizationId: "org-a",
        acceptedAt: null,
        revokedAt: null,
      },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it("returns false when the invitation is already accepted, revoked, or missing", async () => {
    prisma.organizationInvitation.updateMany.mockResolvedValue({ count: 0 });

    await expect(revokeInvitation("invitation-a")).resolves.toBe(false);
  });
});
