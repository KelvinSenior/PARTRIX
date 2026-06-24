import { prisma } from "@/lib/prisma";
import { requireOrganizationContext } from "@/lib/tenant";
import type { DeliveryDTO, DeliveryPayload, DeliveryStatus } from "@/types/delivery";

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

export async function createDelivery(payload: DeliveryPayload): Promise<DeliveryDTO> {
  const user = await requireOrganizationContext();

  // Verify the booking belongs to this org
  const booking = await prisma.booking.findFirst({
    where: { id: payload.bookingId, organizationId: user.organizationId! },
  });
  if (!booking) throw new Error("Booking not found.");

  const delivery = await prisma.delivery.create({
    data: {
      organizationId: user.organizationId!,
      bookingId: payload.bookingId,
      customerId: payload.customerId,
      address: payload.address,
      scheduledAt: new Date(payload.scheduledAt),
      driver: payload.driver ?? null,
      vehicle: payload.vehicle ?? null,
      instructions: payload.instructions ?? null,
      status: "SCHEDULED",
    },
    include,
  });

  return serialize(delivery);
}

export async function listDeliveries(): Promise<DeliveryDTO[]> {
  const user = await requireOrganizationContext();

  const deliveries = await prisma.delivery.findMany({
    where: { organizationId: user.organizationId! },
    orderBy: { scheduledAt: "desc" },
    include,
  });

  return deliveries.map(serialize);
}

export async function getDelivery(id: string): Promise<DeliveryDTO | null> {
  const user = await requireOrganizationContext();

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
  const user = await requireOrganizationContext();

  const existing = await prisma.delivery.findFirst({
    where: { id, organizationId: user.organizationId! },
  });
  if (!existing) throw new Error("Delivery not found.");

  const data: any = { status };
  if (status === "DELIVERED") data.deliveredAt = new Date();
  if (status === "COMPLETED") data.pickupAt = new Date();

  const updated = await prisma.delivery.update({
    where: { id },
    data,
    include,
  });

  return serialize(updated);
}

export async function updateDelivery(
  id: string,
  patch: Partial<DeliveryPayload & { status: DeliveryStatus }>,
): Promise<DeliveryDTO> {
  const user = await requireOrganizationContext();

  const existing = await prisma.delivery.findFirst({
    where: { id, organizationId: user.organizationId! },
  });
  if (!existing) throw new Error("Delivery not found.");

  const data: any = {};
  if (patch.address) data.address = patch.address;
  if (patch.scheduledAt) data.scheduledAt = new Date(patch.scheduledAt);
  if (patch.driver !== undefined) data.driver = patch.driver;
  if (patch.vehicle !== undefined) data.vehicle = patch.vehicle;
  if (patch.instructions !== undefined) data.instructions = patch.instructions;
  if (patch.status) {
    data.status = patch.status;
    if (patch.status === "DELIVERED") data.deliveredAt = new Date();
    if (patch.status === "COMPLETED") data.pickupAt = new Date();
  }

  const updated = await prisma.delivery.update({
    where: { id },
    data,
    include,
  });

  return serialize(updated);
}
