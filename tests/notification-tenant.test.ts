import { beforeEach, describe, expect, it, vi } from "vitest";

const { prisma, requirePermission } = vi.hoisted(() => ({
  prisma: {
    user: { findFirst: vi.fn(), findMany: vi.fn() },
    notification: { createMany: vi.fn(), findMany: vi.fn(), count: vi.fn(), updateMany: vi.fn(), findFirst: vi.fn(), deleteMany: vi.fn() },
  },
  requirePermission: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma }));
vi.mock("@/lib/permissions", () => ({ requirePermission }));

import {
  createNotification,
  deleteNotification,
  deleteReadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notification";

describe("notification recipient isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({ id: "user-a", role: "STAFF", organizationId: "org-a" });
  });

  it("does not create a notification for a recipient from another organization", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    await createNotification({
      organizationId: "org-a",
      userId: "user-b",
      type: "BOOKING",
      title: "Booking updated",
      message: "Updated",
      href: "/bookings/example",
      entity: "Booking",
      entityId: "booking-a",
    });
    expect(prisma.user.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "user-b", organizationId: "org-a", status: "ACTIVE" },
    }));
    expect(prisma.notification.createMany).not.toHaveBeenCalled();
  });

  it("persists recipient-scoped notifications idempotently", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: "user-a" });
    prisma.notification.createMany.mockResolvedValue({ count: 1 });

    await createNotification({
      organizationId: "org-a",
      userId: "user-a",
      type: "PAYMENT",
      title: "Payment received",
      message: "A payment was recorded.",
      href: "/bookings/booking-a",
      entity: "Payment",
      entityId: "payment-a",
    });

    expect(prisma.notification.createMany).toHaveBeenCalledWith(expect.objectContaining({
      data: [expect.objectContaining({ organizationId: "org-a", userId: "user-a", entityId: "payment-a" })],
      skipDuplicates: true,
    }));
  });

  it("scopes notification queries and read updates to the current user and organization", async () => {
    prisma.notification.findMany.mockResolvedValue([]);
    prisma.notification.count.mockResolvedValue(0);
    await listNotifications();
    expect(prisma.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-a", userId: "user-a" },
    }));

    prisma.notification.updateMany.mockResolvedValue({ count: 0 });
    await expect(markNotificationRead("notification-b")).resolves.toBeNull();
    expect(prisma.notification.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "notification-b", organizationId: "org-a", userId: "user-a" },
    }));
  });

  it("scopes mark-all and deletion operations to the current recipient", async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 2 });
    await markAllNotificationsRead();
    expect(prisma.notification.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-a", userId: "user-a", readAt: null },
      data: expect.objectContaining({ readAt: expect.any(Date) }),
    }));

    prisma.notification.deleteMany.mockResolvedValue({ count: 1 });
    await deleteNotification("notification-a");
    expect(prisma.notification.deleteMany).toHaveBeenCalledWith({
      where: { id: "notification-a", organizationId: "org-a", userId: "user-a" },
    });

    await deleteReadNotifications();
    expect(prisma.notification.deleteMany).toHaveBeenLastCalledWith({
      where: { organizationId: "org-a", userId: "user-a", readAt: { not: null } },
    });
  });
});