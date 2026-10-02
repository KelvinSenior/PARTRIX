import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

const { prisma, tx } = vi.hoisted(() => {
  const tx = {
    organizationInvitation: { findUnique: vi.fn(), updateMany: vi.fn() },
    organization: { create: vi.fn(), update: vi.fn() },
    user: { create: vi.fn() },
  };
  return {
    tx,
    prisma: { user: { findUnique: vi.fn() }, $transaction: vi.fn() },
  };
});

vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/jwt", () => ({ verifyToken: vi.fn() }));
vi.mock("bcryptjs", () => ({ default: { hash: vi.fn().mockResolvedValue("password-hash"), compare: vi.fn() } }));

import { registerUser } from "@/services/auth";

describe("single-use organization invitations", () => {
  const token = "b".repeat(64);

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.$transaction.mockImplementation((operation: (client: typeof tx) => unknown) => operation(tx));
    tx.organizationInvitation.findUnique.mockResolvedValue({
      id: "invite-a",
      organizationId: "org-a",
      email: "taylor@example.com",
      role: "STAFF",
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      acceptedAt: null,
    });
    tx.organizationInvitation.updateMany.mockResolvedValue({ count: 1 });
    tx.user.create.mockResolvedValue({ id: "user-a", email: "taylor@example.com", role: "STAFF", organizationId: "org-a" });
  });

  it("consumes a valid invitation and uses its organization and role", async () => {
    const user = await registerUser({
      invitationToken: token,
      name: "Taylor User",
      email: "taylor@example.com",
      password: "SecurePassword!42",
    });

    expect(user).toMatchObject({ organizationId: "org-a", role: "STAFF" });
    expect(tx.organizationInvitation.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: createHash("sha256").update(token).digest("hex") },
    });
    expect(tx.organizationInvitation.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: "invite-a", acceptedAt: null, revokedAt: null }),
    }));
    expect(tx.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ role: "STAFF", organizationId: "org-a" }),
    }));
  });

  it("rejects expired invitations without creating an account", async () => {
    tx.organizationInvitation.findUnique.mockResolvedValueOnce({
      id: "invite-a",
      organizationId: "org-a",
      email: "taylor@example.com",
      role: "STAFF",
      expiresAt: new Date(Date.now() - 1_000),
      revokedAt: null,
      acceptedAt: null,
    });

    await expect(registerUser({ invitationToken: token, name: "Taylor User", email: "taylor@example.com", password: "SecurePassword!42" }))
      .rejects.toThrow("This invitation is invalid or expired.");
    expect(tx.user.create).not.toHaveBeenCalled();
  });

  it("rejects recipient mismatch and failed single-use consumption", async () => {
    await expect(registerUser({ invitationToken: token, name: "Taylor User", email: "other@example.com", password: "SecurePassword!42" }))
      .rejects.toThrow("This invitation is invalid or expired.");

    tx.organizationInvitation.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(registerUser({ invitationToken: token, name: "Taylor User", email: "taylor@example.com", password: "SecurePassword!42" }))
      .rejects.toThrow("This invitation is invalid or expired.");
    expect(tx.user.create).not.toHaveBeenCalled();
  });
});