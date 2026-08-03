import { requireOrganizationContext } from "@/lib/tenant";
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

const fallbackNotifications: NotificationDTO[] = [];

function serializeNotification(notification: any): NotificationDTO {
  let metadata: Record<string, unknown> = {};
  if (notification.metadata && typeof notification.metadata === "object") {
    metadata = notification.metadata as Record<string, unknown>;
  }

  return {
    id: notification.id,
    type: notification.type,
    priority: notification.priority,
    title: notification.title,
    message: notification.message,
    href: notification.href,
    entity: notification.entity,
    entityId: notification.entityId ?? null,
    metadata,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString(),
  };
}

export async function createNotification(input: CreateNotificationInput) {
  if (!input.href) {
    return null;
  }

  return null;
}

export async function listNotifications(filters: ListNotificationFilters = {}) {
  const user = await requireOrganizationContext();
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 5), 100);

  const filtered = fallbackNotifications.filter((notification) => {
    const matchesQuery = !filters.query || [notification.title, notification.message, notification.entity]
      .some((value) => value.toLowerCase().includes(filters.query.toLowerCase()));
    const matchesType = !filters.type || filters.type === "all" || notification.type === filters.type;
    const matchesStatus = !filters.status || filters.status === "all" || (filters.status === "unread" ? !notification.readAt : !!notification.readAt);
    const createdAt = new Date(notification.createdAt);
    const matchesFrom = !filters.dateFrom || createdAt >= filters.dateFrom;
    const matchesTo = !filters.dateTo || createdAt <= filters.dateTo;

    return matchesQuery && matchesType && matchesStatus && matchesFrom && matchesTo;
  });

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    notifications: paged,
    unreadCount: filtered.filter((notification) => !notification.readAt).length,
    total: filtered.length,
    page,
    pageSize,
  };
}

export async function markNotificationRead(id: string) {
  await requireOrganizationContext();
  return null;
}

export async function markAllNotificationsRead() {
  await requireOrganizationContext();
}

export async function deleteNotification(id: string) {
  await requireOrganizationContext();
}

export async function deleteReadNotifications() {
  await requireOrganizationContext();
}
