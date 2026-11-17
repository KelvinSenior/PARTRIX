import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma";
import { requirePermission } from "@/lib/permissions";
import { getOrganizationSettings } from "@/services/settings";
import type { DeliveryDTO, DeliveryPayload, DeliveryStatus } from "@/types/delivery";
import { getInventoryAvailability } from "@/services/inventoryAvailability";

function serialize(d: any): DeliveryDTO {
  return {
    id: d.id,
    bookingId: d.bookingId,
    bookingNumber: d.booking?.bookingNumber ?? null,
    customerId: d.customerId,
    customerName: d.customer
      ? `${d.customer.firstName} ${d.customer.lastName}`
      : null,
    address: d.address,
    scheduledAt: d.scheduledAt.toISOString(),
    deliveredAt: d.deliveredAt ? d.deliveredAt.toISOString() : null,
    pickupAt: d.pickupAt ? d.pickupAt.toISOString() : null,
    driver: d.driver ?? null,
    vehicle: d.vehicle ?? null,
    instructions: d.instructions ?? null,
    status: d.status as DeliveryStatus,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

const include = {
  booking: { select: { bookingNumber: true } },
  customer: { select: { firstName: true, lastName: true } },
};

async function runSerializable<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: "Serializable",
        timeout: 20000,
        maxWait: 20000,
      });
    } catch (error) {
      const code = typeof error === "object" && error !== null && "code" in error
        ? (error as { code?: unknown }).code
        : null;
      if (code !== "P2034" || attempt === 2) throw error;
    }
  }
  throw new Error("Delivery transaction could not be completed.");
}

async function ensureBookingAvailability(
  tx: Prisma.TransactionClient,
  organizationId: string,
  booking: {
    id: string;
    eventDate: Date;
    returnDate: Date | null;
    bookingItems: Array<{ inventoryItemId: string; quantity: number; returnedQuantity: number }>;
  },
  deliveryDate: Date,
  timeZone: string,
) {
  const itemIds = [...new Set(booking.bookingItems.map((item) => item.inventoryItemId))];
  const inventoryItems = await tx.inventoryItem.findMany({
    where: { id: { in: itemIds }, organizationId },
  });
  if (inventoryItems.length !== itemIds.length) {
    throw new Error("One or more booking inventory items are invalid.");
  }

  const availability = await getInventoryAvailability(
    organizationId,
    inventoryItems,
    {
      eventDate: booking.eventDate,
      deliveryDate,
      returnDate: booking.returnDate,
    },
    { client: tx, excludeBookingId: booking.id, timeZone },
  );

  for (const item of booking.bookingItems) {
    const inventoryItem = inventoryItems.find((row) => row.id === item.inventoryItemId);
    const quantity = Math.max(0, item.quantity - item.returnedQuantity);
    const available = availability.get(item.inventoryItemId)?.availableQuantity ?? 0;
    if (!inventoryItem || inventoryItem.status !== "AVAILABLE" || quantity > available) {
      throw new Error(`Insufficient availability for ${inventoryItem?.name ?? "one or more items"} on the delivery schedule.`);
    }
  }
}

function dateStart(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export async function createDelivery(payload: DeliveryPayload): Promise<DeliveryDTO> {
  const user = await requirePermission("deliveries:write");
  const settings = await getOrganizationSettings();
  const organizationId = user.organizationId!;
  const scheduledAt = new Date(payload.scheduledAt);

  const delivery = await runSerializable(async (tx) => {
    const [booking, customer] = await Promise.all([
      tx.booking.findFirst({
        where: { id: payload.bookingId, organizationId },
        include: {
          bookingItems: { select: { inventoryItemId: true, quantity: true, returnedQuantity: true } },
          delivery: { select: { id: true } },
        },
      }),
      tx.customer.findFirst({
        where: { id: payload.customerId, organizationId },
        select: { id: true },
      }),
    ]);
    if (!booking || !customer || booking.customerId !== payload.customerId) {
      throw new Error("Booking or customer not found.");
    }
    if (booking.delivery) throw new Error("A delivery is already scheduled for this booking.");
    if (["CANCELLED", "COMPLETED", "NO_SHOW"].includes(booking.status)) {
      throw new Error("A delivery cannot be scheduled for a closed booking.");
    }
    if (dateStart(scheduledAt) > dateStart(booking.eventDate)) {
      throw new Error("Delivery must be scheduled on or before the event date.");
    }

    await ensureBookingAvailability(
      tx,
      organizationId,
      booking,
      scheduledAt,
      settings.localization.timeZone,
    );
    await tx.booking.update({
      where: { id: booking.id, organizationId },
      data: { deliveryDate: scheduledAt },
    });

    return tx.delivery.create({
      data: {
        organizationId,
        bookingId: payload.bookingId,
        customerId: payload.customerId,
        address: payload.address,
        scheduledAt,
        driver: payload.driver ?? null,
        vehicle: payload.vehicle ?? null,
        instructions: payload.instructions ?? null,
        status: "SCHEDULED",
      },
      include,
    });
  });

  return serialize(delivery);
}

export async function listDeliveries(): Promise<DeliveryDTO[]> {
  const user = await requirePermission("deliveries:read");

  const deliveries = await prisma.delivery.findMany({
    where: { organizationId: user.organizationId! },
    orderBy: { scheduledAt: "desc" },
    include,
  });

  return deliveries.map(serialize);
}

export async function getDelivery(id: string): Promise<DeliveryDTO | null> {
  const user = await requirePermission("deliveries:read");

  const delivery = await prisma.delivery.findFirst({
    where: { id, organizationId: user.organizationId! },
    include,
  });

  return delivery ? serialize(delivery) : null;
}

export async function updateDeliveryStatus(
  id: string,
  status: DeliveryStatus,
): Promise<DeliveryDTO> {
  return updateDelivery(id, { status });
}

export async function updateDelivery(
  id: string,
  patch: Partial<DeliveryPayload & { status: DeliveryStatus }>,
): Promise<DeliveryDTO> {
  const user = await requirePermission("deliveries:write");
  const settings = await getOrganizationSettings();
  const organizationId = user.organizationId!;

  const updated = await runSerializable(async (tx) => {
    const existing = await tx.delivery.findFirst({
      where: { id, organizationId },
      include: {
        booking: {
          include: {
            bookingItems: true,
          },
        },
      },
    });
    if (!existing) throw new Error("Delivery not found.");

    const nextStatus = patch.status ?? existing.status;
    const transitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      SCHEDULED: ["IN_TRANSIT", "CANCELLED"],
      IN_TRANSIT: ["DELIVERED", "CANCELLED"],
      DELIVERED: ["COMPLETED"],
      COMPLETED: [],
      CANCELLED: [],
    };
    if (patch.status && patch.status !== existing.status && !transitions[existing.status].includes(patch.status)) {
      throw new Error(`Delivery cannot move from ${existing.status} to ${patch.status}.`);
    }

    const booking = existing.booking;
    const physicallyOut = booking.status === "IN_PROGRESS" ||
      ["IN_TRANSIT", "DELIVERED"].includes(existing.status);
    const outstandingItems = booking.bookingItems.filter((item) => item.quantity > item.returnedQuantity);
    if (
      nextStatus === "CANCELLED" &&
      physicallyOut &&
      outstandingItems.length > 0
    ) {
      throw new Error("Record the actual return before cancelling a delivery with items physically out.");
    }
    if (nextStatus === "COMPLETED" && outstandingItems.length > 0) {
      throw new Error("Record returned quantities from the booking before completing this delivery.");
    }

    const scheduledAt = patch.scheduledAt ? new Date(patch.scheduledAt) : existing.scheduledAt;
    const scheduleChanged = scheduledAt.getTime() !== existing.scheduledAt.getTime();
    if (scheduleChanged && existing.status !== "SCHEDULED") {
      throw new Error("A delivery schedule cannot be changed after dispatch.");
    }
    if (scheduleChanged) {
      if (dateStart(scheduledAt) > dateStart(booking.eventDate)) {
        throw new Error("Delivery must be scheduled on or before the event date.");
      }
      await ensureBookingAvailability(
        tx,
        organizationId,
        booking,
        scheduledAt,
        settings.localization.timeZone,
      );
    }

    const data: Prisma.DeliveryUpdateInput = {
      ...(patch.address ? { address: patch.address } : {}),
      ...(scheduleChanged ? { scheduledAt } : {}),
      ...(patch.driver !== undefined ? { driver: patch.driver } : {}),
      ...(patch.vehicle !== undefined ? { vehicle: patch.vehicle } : {}),
      ...(patch.instructions !== undefined ? { instructions: patch.instructions } : {}),
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
      ...(patch.status === "COMPLETED" ? { pickupAt: new Date() } : {}),
    };

    if (scheduleChanged) {
      await tx.booking.update({
        where: { id: booking.id, organizationId },
        data: { deliveryDate: scheduledAt },
      });
    }

    if (
      (nextStatus === "IN_TRANSIT" || nextStatus === "DELIVERED") &&
      !physicallyOut
    ) {
      if (!["CONFIRMED", "IN_PROGRESS"].includes(booking.status)) {
        throw new Error("Confirm the booking before dispatching its items.");
      }
      await ensureBookingAvailability(
        tx,
        organizationId,
        booking,
        existing.scheduledAt,
        settings.localization.timeZone,
      );
      for (const item of outstandingItems) {
        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId, organizationId },
          data: {
            availableQuantity: { decrement: item.quantity - item.returnedQuantity },
            rentedQuantity: { increment: item.quantity - item.returnedQuantity },
          },
        });
      }
      await tx.booking.update({
        where: { id: booking.id, organizationId },
        data: { status: "IN_PROGRESS" },
      });
    }

    return tx.delivery.update({
      where: { id, organizationId },
      data,
      include,
    });
  });

  return serialize(updated);
}
