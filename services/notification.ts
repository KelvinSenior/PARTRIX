import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import type { NotificationDTO, NotificationPriority, NotificationType } from "@/types/notification";

type CreateNotificationInput = {
  organizationId: string;
  userId?: string | null;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  href: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  dedupeKey?: string;
  tx?: any;
};

type ListNotificationFilters = {
  query?: string;
  type?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
};

export async function createNotification(input: CreateNotificationInput) {
  if (!input.href || !input.title.trim() || !input.message.trim()) return null;

  try {
    const client = input.tx ?? prisma;
    const recipients = input.userId
      ? await client.user.findFirst({
          where: { id: input.userId, organizationId: input.organizationId, status: "ACTIVE" },
          select: { id: true },
        }).then((recipient: { id: string } | null) => recipient ? [recipient] : [])
      : await client.user.findMany({
          where: { organizationId: input.organizationId, status: "ACTIVE" },
          select: { id: true },
        });
    if (!recipients.length) return null;

    const dedupeKey = input.dedupeKey ?? (input.entityId
      ? createHash("sha256")
          .update(JSON.stringify([input.type, input.entity, input.entityId, input.title, input.metadata ?? null]))
          .digest("hex")
      : null);

    await client.notification.createMany({
      data: recipients.map((recipient: { id: string }) => ({
        organizationId: input.organizationId,
        userId: recipient.id,
        type: input.type,
        priority: input.priority ?? "INFO",
        title: input.title,
        message: input.message,
        href: input.href,
        entity: input.entity,
        entityId: input.entityId ?? null,
        metadata: input.metadata ?? undefined,
        dedupeKey,
      })),
      skipDuplicates: true,
    });
    return { created: recipients.length };
  } catch (error) {
    console.error("[NOTIFICATION] Could not persist notification:", error);
    return null;
  }
}

export async function listNotifications(filters: ListNotificationFilters = {}) {
  const user = await requirePermission("notifications:manage");
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 5), 100);

  const query = filters.query?.trim().toLowerCase() ?? "";
  const where: any = { organizationId: user.organizationId!, userId: user.id };
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { message: { contains: query, mode: "insensitive" } },
      { entity: { contains: query, mode: "insensitive" } },
    ];
  }
  if (filters.type && filters.type !== "all") where.type = filters.type;
  if (filters.status === "unread") where.readAt = null;
  if (filters.status === "read") where.readAt = { not: null };
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
    if (filters.dateTo) where.createdAt.lte = filters.dateTo;
  }

  const [rows, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { organizationId: user.organizationId!, userId: user.id, readAt: null } }),
  ]);

  return {
    notifications: rows.map((notification) => ({
      id: notification.id,
      type: notification.type,
      priority: notification.priority,
      title: notification.title,
      message: notification.message,
      href: notification.href,
      entity: notification.entity,
      entityId: notification.entityId,
      metadata: (notification.metadata as Record<string, unknown> | null) ?? {},
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    })),
    unreadCount,
    total,
    page,
    pageSize,
  };
}

export async function markNotificationRead(id: string): Promise<NotificationDTO | null> {
  const user = await requirePermission("notifications:manage");
  const result = await prisma.notification.updateMany({
    where: { id, organizationId: user.organizationId!, userId: user.id },
    data: { readAt: new Date() },
  });
  if (!result.count) return null;

  const notification = await prisma.notification.findFirst({
    where: { id, organizationId: user.organizationId!, userId: user.id },
  });
  if (!notification) return null;
  return {
    id: notification.id,
    type: notification.type,
    priority: notification.priority,
    title: notification.title,
    message: notification.message,
    href: notification.href,
    entity: notification.entity,
    entityId: notification.entityId,
    metadata: (notification.metadata as Record<string, unknown> | null) ?? {},
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}

export async function markAllNotificationsRead() {
  const user = await requirePermission("notifications:manage");
  return prisma.notification.updateMany({
    where: { organizationId: user.organizationId!, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function deleteNotification(id: string) {
  const user = await requirePermission("notifications:manage");
  return prisma.notification.deleteMany({ where: { id, organizationId: user.organizationId!, userId: user.id } });
}

export async function deleteReadNotifications() {
  const user = await requirePermission("notifications:manage");
  return prisma.notification.deleteMany({ where: { organizationId: user.organizationId!, userId: user.id, readAt: { not: null } } });
}
