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

import { createNotification, listNotifications, markNotificationRead } from "@/services/notification";

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
});