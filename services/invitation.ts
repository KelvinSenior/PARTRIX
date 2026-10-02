import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

const INVITATION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export async function createInvitation(email: string, role: "MANAGER" | "STAFF") {
  const user = await requirePermission("members:manage");

  const normalizedEmail = email.trim().toLowerCase();
  if (await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } })) {
    throw new Error("An account already exists for this email address.");
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + INVITATION_LIFETIME_MS);

  const invitation = await prisma.$transaction(async (tx) => {
    await tx.organizationInvitation.updateMany({
      where: {
        organizationId: user.organizationId!,
        email: normalizedEmail,
        acceptedAt: null,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return tx.organizationInvitation.create({
      data: {
        organizationId: user.organizationId!,
        createdById: user.id,
        email: normalizedEmail,
        role,
        tokenHash,
        expiresAt,
      },
      select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
    });
  });

  return { ...invitation, token };
}

export async function listInvitations() {
  const user = await requirePermission("members:manage");

  const invitations = await prisma.organizationInvitation.findMany({
    where: { organizationId: user.organizationId! },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
      revokedAt: true,
      acceptedAt: true,
      createdAt: true,
    },
  });

  const now = new Date();
  return invitations.map(({ revokedAt, acceptedAt, expiresAt, ...invitation }) => ({
    ...invitation,
    expiresAt: expiresAt.toISOString(),
    createdAt: invitation.createdAt.toISOString(),
    status: acceptedAt ? "ACCEPTED" : revokedAt ? "REVOKED" : expiresAt <= now ? "EXPIRED" : "PENDING",
  }));
}

export async function revokeInvitation(id: string) {
  const user = await requirePermission("members:manage");

  const result = await prisma.organizationInvitation.updateMany({
    where: {
      id,
      organizationId: user.organizationId!,
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { revokedAt: new Date() },
  });

  return result.count === 1;
}