export type NotificationType = "BOOKING" | "PAYMENT" | "INVENTORY" | "INVOICE" | "ORGANIZATION" | "SYSTEM";
export type NotificationPriority = "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  href: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationDTO[];
  unreadCount: number;
  total: number;
  page: number;
  pageSize: number;
}
