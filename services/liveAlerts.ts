import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { getOrganizationSettings } from "@/services/settings";
import { getInventoryAvailability } from "@/services/inventoryAvailability";

export type LiveAlertCounts = {
  pendingBookings: number;
  lowStockItems: number;
  deliveriesToday: number;
};

type ZonedDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getZonedParts(date: Date, timeZone: string): ZonedDateParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function zonedMidnight(year: number, month: number, day: number, timeZone: string) {
  const targetLocalTime = Date.UTC(year, month - 1, day);
  let timestamp = targetLocalTime;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const local = getZonedParts(new Date(timestamp), timeZone);
    const observedLocalTime = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second,
    );
    const adjustment = targetLocalTime - observedLocalTime;
    timestamp += adjustment;
    if (adjustment === 0) break;
  }

  return new Date(timestamp);
}

function getTodayRange(timeZone: string, now: Date) {
  const { year, month, day } = getZonedParts(now, timeZone);
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1));

  return {
    start: zonedMidnight(year, month, day, timeZone),
    end: zonedMidnight(
      nextDay.getUTCFullYear(),
      nextDay.getUTCMonth() + 1,
      nextDay.getUTCDate(),
      timeZone,
    ),
  };
}

export async function getLiveAlertCounts(now = new Date()): Promise<LiveAlertCounts> {
  const [bookingUser, inventoryUser, deliveryUser, settings] = await Promise.all([
    requirePermission("bookings:read"),
    requirePermission("inventory:read"),
    requirePermission("deliveries:read"),
    getOrganizationSettings(),
  ]);
  const bookingOrganizationId = bookingUser.organizationId!;
  const inventoryOrganizationId = inventoryUser.organizationId!;
  const deliveryOrganizationId = deliveryUser.organizationId!;
  const deliveryRange = getTodayRange(settings.localization.timeZone, now);
  const todayParts = getZonedParts(now, settings.localization.timeZone);
  const today = new Date(Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day));

  const [pendingBookings, inventoryItems, deliveriesToday] = await Promise.all([
    prisma.booking.count({
      where: { organizationId: bookingOrganizationId, status: "PENDING" },
    }),
    prisma.inventoryItem.findMany({
      where: { organizationId: inventoryOrganizationId },
      select: {
        id: true,
        totalQuantity: true,
        rentedQuantity: true,
        damagedQuantity: true,
        minimumThreshold: true,
        status: true,
      },
    }),
    prisma.delivery.count({
      where: {
        organizationId: deliveryOrganizationId,
        status: { in: ["SCHEDULED", "IN_TRANSIT"] },
        scheduledAt: { gte: deliveryRange.start, lt: deliveryRange.end },
      },
    }),
  ]);
  const availability = await getInventoryAvailability(
    inventoryOrganizationId,
    inventoryItems,
    { eventDate: today, returnDate: today },
    { now, timeZone: settings.localization.timeZone },
  );

  return {
    pendingBookings,
    lowStockItems: inventoryItems.filter(
      (item) => (availability.get(item.id)?.availableQuantity ?? 0) <= item.minimumThreshold,
    ).length,
    deliveriesToday,
  };
}
