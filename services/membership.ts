import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

export async function listOrganizationMembers() {
  const user = await requirePermission("members:manage");
  const members = await prisma.user.findMany({
    where: { organizationId: user.organizationId! },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });
  return members.map((member) => ({ ...member, createdAt: member.createdAt.toISOString() }));
}

export async function changeMemberRole(id: string, role: "MANAGER" | "STAFF") {
  const user = await requirePermission("members:manage");
  if (id === user.id) throw new Error("You cannot change your own role.");

  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.findUnique({
      where: { id: user.organizationId! },
      select: { ownerId: true },
    });
    const member = await tx.user.findFirst({
      where: { id, organizationId: user.organizationId! },
      select: { id: true },
    });
    if (!member) return false;
    if (organization?.ownerId === id) throw new Error("The workspace owner cannot be demoted.");

    await tx.user.update({ where: { id: member.id }, data: { role } });
    return true;
  });
}

export async function removeOrganizationMember(id: string) {
  const user = await requirePermission("members:manage");
  if (id === user.id) throw new Error("You cannot remove yourself from the workspace.");

  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.findUnique({
      where: { id: user.organizationId! },
      select: { ownerId: true },
    });
    const member = await tx.user.findFirst({
      where: { id, organizationId: user.organizationId! },
      select: { id: true },
    });
    if (!member) return false;
    if (organization?.ownerId === id) throw new Error("The workspace owner cannot be removed.");

    await tx.user.delete({ where: { id: member.id } });
    return true;
  });
}