import type { Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import type { InventoryStatus } from "@/types/inventory";

type AvailabilityClient = Pick<Prisma.TransactionClient, "bookingItem">;

type StockItem = {
  id: string;
  totalQuantity: number;
  damagedQuantity?: number;
  rentedQuantity?: number;
  status: InventoryStatus;
};

export type RentalAvailabilityWindow = {
  eventDate: Date;
  deliveryDate?: Date | null;
  returnDate?: Date | null;
};

export type InventoryAvailability = {
  availableQuantity: number;
  committedQuantity: number;
};

const committingStatuses = ["PENDING", "CONFIRMED", "IN_PROGRESS"] as const;
const DAY_MS = 24 * 60 * 60 * 1000;

function utcDayStart(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function getCalendarDateStart(date: Date, timeZone: string): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)));
}

function getWindow(window: RentalAvailabilityWindow) {
  const startDates = [window.eventDate, window.deliveryDate]
    .filter((date): date is Date => date instanceof Date && Number.isFinite(date.getTime()))
    .map(utcDayStart);
  const start = Math.min(...startDates);
  const returnDate = window.returnDate ?? window.eventDate;
  const end = utcDayStart(returnDate) + DAY_MS;

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new Error("The requested rental dates are invalid.");
  }

  return { start, end };
}

function bookingWindow(booking: {
  eventDate: Date;
  deliveryDate: Date | null;
  returnDate: Date | null;
  delivery: { scheduledAt: Date; status: string } | null;
}) {
  const deliveryDates = (
    booking.delivery
      ? booking.delivery.status === "CANCELLED" ? [] : [booking.delivery.scheduledAt]
      : [booking.deliveryDate]
  ).filter((date): date is Date => date instanceof Date && Number.isFinite(date.getTime()));
  const startDates = [booking.eventDate, ...deliveryDates].map(utcDayStart);
  const start = Math.min(...startDates);
  const returnDate = booking.returnDate ?? booking.eventDate;
  const end = utcDayStart(returnDate) + DAY_MS;

  return { start, end, returnDate: utcDayStart(returnDate) };
}

export async function getInventoryAvailability(
  organizationId: string,
  stockItems: StockItem[],
  requestedWindow: RentalAvailabilityWindow,
  options: {
    excludeBookingId?: string;
    now?: Date;
    timeZone?: string;
    client?: AvailabilityClient;
    includeReservations?: boolean;
  } = {},
): Promise<Map<string, InventoryAvailability>> {
  const inventoryIds = [...new Set(stockItems.map((item) => item.id))];
  const result = new Map<string, InventoryAvailability>();

  for (const item of stockItems) {
    const usableQuantity = item.status === "AVAILABLE"
      ? Math.max(0, item.totalQuantity - (item.damagedQuantity ?? 0))
      : 0;
    const physicallyOut = Math.max(0, item.rentedQuantity ?? 0);
    result.set(item.id, {
      availableQuantity: Math.max(0, usableQuantity - physicallyOut),
      committedQuantity: physicallyOut,
    });
  }

  if (!inventoryIds.length || options.includeReservations === false) return result;

  const client = options.client ?? prisma;
  const requested = getWindow(requestedWindow);
  const now = options.now ?? new Date();
  const today = utcDayStart(
    options.timeZone ? getCalendarDateStart(now, options.timeZone) : now,
  );
  const reservations = await client.bookingItem.findMany({
    where: {
      organizationId,
      inventoryItemId: { in: inventoryIds },
      booking: {
        organizationId,
        status: { in: [...committingStatuses] },
        ...(options.excludeBookingId ? { id: { not: options.excludeBookingId } } : {}),
      },
    },
    select: {
      inventoryItemId: true,
      quantity: true,
      returnedQuantity: true,
      booking: {
        select: {
          eventDate: true,
          deliveryDate: true,
          returnDate: true,
          status: true,
          delivery: { select: { scheduledAt: true, status: true } },
        },
      },
    },
  });

  for (const reservation of reservations) {
    const outstanding = Math.max(0, reservation.quantity - reservation.returnedQuantity);
    if (outstanding === 0) continue;

    const physicallyOut = reservation.booking.status === "IN_PROGRESS" ||
      ["IN_TRANSIT", "DELIVERED"].includes(reservation.booking.delivery?.status ?? "");
    if (physicallyOut) continue;

    const scheduled = bookingWindow(reservation.booking);
    const overdue = scheduled.returnDate <= today;
    const effectiveEnd = overdue ? Number.POSITIVE_INFINITY : scheduled.end;
    if (scheduled.start >= requested.end || effectiveEnd <= requested.start) continue;

    const availability = result.get(reservation.inventoryItemId);
    if (!availability) continue;
    availability.committedQuantity += outstanding;
    availability.availableQuantity = Math.max(0, availability.availableQuantity - outstanding);
  }

  return result;
}
