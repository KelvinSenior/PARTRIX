import type { BookingPayload, BookingDTO, BookingListResponse, BookingReturnPayload } from "@/types/booking";
import { prisma } from "@/lib/prisma";
import { requireOrganizationContext } from "@/lib/tenant";
import { getOrganizationSettings } from "@/services/settings";
import { logActivity } from "@/services/audit";

const activeBookingStatuses: string[] = ["PENDING", "CONFIRMED", "IN_PROGRESS"];

function formatBookingNumber(): string {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "");
  const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BKG-${timestamp}-${suffix}`;
}

function decimalToNumber(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number(value);
  }
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    return Number((value as { toNumber: () => number }).toNumber());
  }
  if (typeof value === "object" && value !== null && "toString" in value) {
    return Number((value as { toString: () => string }).toString());
  }
  return 0;
}

function serializeBookingItem(item: any): BookingDTO["bookingItems"][number] {
  return {
    id: item.id,
    inventoryItemId: item.inventoryItemId,
    inventoryItemName: item.inventoryItem.name,
    quantity: item.quantity,
    unitPrice: decimalToNumber(item.unitPrice),
    discount: decimalToNumber(item.discount),
    totalPrice: decimalToNumber(item.totalPrice),
    returnedQuantity: item.returnedQuantity,
    notes: item.notes ?? null,
  };
}

function serializeBooking(booking: any): BookingDTO {
  return {
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    customer: {
      id: booking.customer.id,
      firstName: booking.customer.firstName,
      lastName: booking.customer.lastName,
      email: booking.customer.email,
      phone: booking.customer.phone,
      company: booking.customer.company,
      address: booking.customer.address,
    },
    eventDate: booking.eventDate.toISOString(),
    deliveryDate: booking.deliveryDate?.toISOString() ?? null,
    returnDate: booking.returnDate?.toISOString() ?? null,
    status: booking.status,
    notes: booking.notes ?? null,
    deliveryFee: decimalToNumber(booking.deliveryFee),
    setupFee: decimalToNumber(booking.setupFee),
    discount: decimalToNumber(booking.discount),
    totalAmount: decimalToNumber(booking.totalAmount),
    depositAmount: decimalToNumber(booking.depositAmount),
    depositPaid: decimalToNumber(booking.depositPaid),
    depositRefunded: decimalToNumber(booking.depositRefunded),
    depositOutstanding: Math.max(
      0,
      decimalToNumber(booking.depositAmount) - decimalToNumber(booking.depositPaid),
    ),
    depositStatus: booking.depositStatus,
    refundStatus: booking.refundStatus,
    balanceDue: decimalToNumber(booking.balanceDue),
    bookingItems: booking.bookingItems.map(serializeBookingItem),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

async function findOrCreateCustomer(customer: BookingPayload["customer"], tx: any, organizationId: string) {
  if (customer.id) {
    const existing = await tx.customer.findFirst({ where: { id: customer.id, organizationId } });
    if (existing) {
      return { connect: { id: existing.id } };
    }
  }

  if (customer.email) {
    const existingCustomer = await tx.customer.findFirst({ where: { email: customer.email, organizationId } });
    if (existingCustomer) {
      return { connect: { id: existingCustomer.id } };
    }
  }

  return {
    create: {
      organizationId,
      firstName: customer.firstName ?? "",
      lastName: customer.lastName ?? "",
      email: customer.email || null,
      phone: customer.phone ?? null,
      company: customer.company ?? null,
      address: customer.address ?? null,
    },
  };
}

async function getOverlappingReservedQuantities(
  itemIds: string[],
  eventDate: Date,
  returnDate: Date,
  tx: any,
) {
  const bookings = await tx.bookingItem.findMany({
    where: {
      inventoryItemId: { in: itemIds },
      booking: {
        status: { in: activeBookingStatuses as string[] },
        eventDate: { lte: returnDate },
        OR: [
          { returnDate: { gte: eventDate } },
          { returnDate: null, eventDate: { gte: eventDate } },
        ],
      },
    },
    select: {
      inventoryItemId: true,
      quantity: true,
    },
  });

  return bookings.reduce((acc: Record<string, number>, item: { inventoryItemId: string; quantity: number }) => {
    acc[item.inventoryItemId] = (acc[item.inventoryItemId] ?? 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);
}

async function computeBookingTotals(
  payload: BookingPayload,
  inventoryData: Array<{ id: string; unitPrice: string }>,
  depositPercent: number,
) {
  const itemTotals = payload.items.map((item) => {
    const inventory = inventoryData.find((record) => record.id === item.inventoryItemId);
    const unitPrice = inventory ? Number(inventory.unitPrice) : 0;
    const lineTotal = Number((unitPrice * item.quantity - item.discount).toFixed(2));
    return {
      ...item,
      unitPrice,
      totalPrice: Math.max(lineTotal, 0),
    };
  });

  const itemSum = itemTotals.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = Number(
    (itemSum + payload.deliveryFee + payload.setupFee - payload.discount).toFixed(2),
  );
  const deposit = Number(((total * depositPercent) / 100).toFixed(2));
  const balance = total;

  return { itemTotals, total, deposit, balance };
}

export async function createBooking(payload: BookingPayload): Promise<BookingDTO> {
  const user = await requireOrganizationContext();
  const settings = await getOrganizationSettings();
  const depositPercent = settings.deposit.requiredDepositPercent;

  return prisma.$transaction(async (tx) => {
    const eventDate = new Date(payload.eventDate);
    const returnDate = payload.returnDate ? new Date(payload.returnDate) : eventDate;
    const itemIds = payload.items.map((item) => item.inventoryItemId);

    const inventoryItems = await tx.inventoryItem.findMany({
      where: { id: { in: itemIds }, organizationId: user.organizationId! },
    });

    if (inventoryItems.length !== payload.items.length) {
      throw new Error("One or more inventory items are invalid.");
    }

    const reservedAmounts = await getOverlappingReservedQuantities(itemIds, eventDate, returnDate, tx);

    const itemsData = payload.items.map((item) => {
      const inventoryItem = inventoryItems.find((record) => record.id === item.inventoryItemId);
      if (!inventoryItem) {
        throw new Error("Selected inventory item no longer exists.");
      }

      if (inventoryItem.status !== "AVAILABLE") {
        throw new Error(`"${inventoryItem.name}" is not available for booking.`);
      }

      const reservedQuantity = reservedAmounts[inventoryItem.id] ?? 0;
      const availableForPeriod = inventoryItem.totalQuantity - reservedQuantity;

      if (item.quantity > availableForPeriod) {
        throw new Error(
          `Insufficient availability for ${inventoryItem.name}. Only ${availableForPeriod} unit(s) are available for these dates.`,
        );
      }

      return {
        organization: { connect: { id: user.organizationId! } },
        inventoryItem: { connect: { id: inventoryItem.id } },
        quantity: item.quantity,
        unitPrice: inventoryItem.unitPrice.toString(),
        discount: item.discount.toString(),
        totalPrice: (inventoryItem.unitPrice.toNumber() * item.quantity - item.discount).toFixed(2),
        notes: item.notes ?? null,
      };
    });

    const totals = await computeBookingTotals(
      payload,
      inventoryItems.map((item) => ({ id: item.id, unitPrice: item.unitPrice.toString() })),
      depositPercent,
    );

    const booking = await tx.booking.create({
      data: {
        organization: { connect: { id: user.organizationId! } },
        bookingNumber: formatBookingNumber(),
        customer: await findOrCreateCustomer(payload.customer, tx, user.organizationId!),
        eventDate,
        deliveryDate: payload.deliveryDate ? new Date(payload.deliveryDate) : null,
        returnDate: payload.returnDate ? new Date(payload.returnDate) : null,
        status: payload.status,
        notes: payload.notes ?? null,
        deliveryFee: payload.deliveryFee.toString(),
        setupFee: payload.setupFee.toString(),
        discount: payload.discount.toString(),
        totalAmount: totals.total.toString(),
        depositAmount: totals.deposit.toString(),
        depositPaid: 0,
        depositRefunded: 0,
        depositStatus: "PENDING",
        refundStatus: "NONE",
        balanceDue: totals.balance.toString(),
        bookingItems: {
          create: itemsData,
        },
      } as any,
      include: {
        customer: true,
        bookingItems: {
          include: { inventoryItem: true },
        },
      },
    });

    await Promise.all(
      payload.items.map((item) =>
        tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            availableQuantity: { decrement: item.quantity },
            rentedQuantity: { increment: item.quantity },
          },
        }),
      ),
    );

    await logActivity({
      tx,
      organizationId: user.organizationId!,
      userId: user.id,
      bookingId: booking.id,
      action: "Create booking",
      entity: "Booking",
      entityId: booking.id,
      details: {
        bookingNumber: booking.bookingNumber,
        totalAmount: totals.total,
        depositAmount: totals.deposit,
      },
      level: "INFO",
    });

    return serializeBooking(booking as Awaited<ReturnType<typeof prisma.booking.findUnique>>);
  });
}

export async function listBookings(opts?: {
  search?: string;
  status?: string;
}): Promise<BookingListResponse> {
  const user = await requireOrganizationContext();

  const where: any = { organizationId: user.organizationId! };

  if (opts?.status && opts.status !== "all") {
    where.status = opts.status;
  }

  if (opts?.search) {
    where.OR = [
      { bookingNumber: { contains: opts.search, mode: "insensitive" } },
      { customer: { firstName: { contains: opts.search, mode: "insensitive" } } },
      { customer: { lastName: { contains: opts.search, mode: "insensitive" } } },
      { customer: { email: { contains: opts.search, mode: "insensitive" } } },
    ];
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      bookingItems: { include: { inventoryItem: true } },
    },
    take: 200,
  });

  return {
    bookings: bookings.map((booking) => serializeBooking(booking as Awaited<ReturnType<typeof prisma.booking.findUnique>>)),
  };
}

export async function getBooking(id: string): Promise<BookingDTO | null> {
  const user = await requireOrganizationContext();
  const booking = await prisma.booking.findFirst({
    where: { id, organizationId: user.organizationId! },
    include: {
      customer: true,
      bookingItems: { include: { inventoryItem: true } },
    },
  });

  return booking ? serializeBooking(booking as Awaited<ReturnType<typeof prisma.booking.findUnique>>) : null;
}

export async function returnBookingItems(
  bookingId: string,
  payload: BookingReturnPayload,
): Promise<BookingDTO> {
  const user = await requireOrganizationContext();

  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: { id: bookingId, organizationId: user.organizationId! },
      include: { bookingItems: true },
    });

    if (!booking) {
      throw new Error("Booking not found.");
    }

    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      throw new Error("This booking cannot be returned.");
    }

    const bookingItemMap = new Map((booking.bookingItems as any[]).map((item: any) => [item.id, item]));

    const updates = payload.returnItems.map((returnItem) => {
      const bookingItem = bookingItemMap.get(returnItem.bookingItemId);
      if (!bookingItem) {
        throw new Error("One or more booking items are invalid.");
      }

      const remainingQuantity = bookingItem.quantity - bookingItem.returnedQuantity;
      if (returnItem.quantity > remainingQuantity) {
        throw new Error(
          `Cannot return more than ${remainingQuantity} unit(s) for this booking item.`,
        );
      }

      return {
        bookingItem,
        quantity: returnItem.quantity,
      };
    });

    await Promise.all(
      updates.map((update) =>
        tx.bookingItem.update({
          where: { id: update.bookingItem.id },
          data: { returnedQuantity: { increment: update.quantity } } as any,
        }),
      ),
    );

    await Promise.all(
      updates.map((update) =>
        tx.inventoryItem.update({
          where: { id: update.bookingItem.inventoryItemId },
          data: {
            availableQuantity: { increment: update.quantity },
            rentedQuantity: { decrement: update.quantity },
          },
        }),
      ),
    );

    const updatedBookingItems = await tx.bookingItem.findMany({
      where: { bookingId },
      include: { inventoryItem: true },
    }) as any[];

    const allReturned = updatedBookingItems.every(
      (item) => item.returnedQuantity >= item.quantity,
    );

    const finalStatus = allReturned ? "COMPLETED" : booking.status;

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: finalStatus,
      },
      include: {
        customer: true,
        bookingItems: { include: { inventoryItem: true } },
      },
    });

    await logActivity({
      tx,
      organizationId: user.organizationId!,
      userId: user.id,
      bookingId,
      action: "Return booking items",
      entity: "Booking",
      entityId: bookingId,
      details: {
        returnItems: updates.map((update) => ({
          bookingItemId: update.bookingItem.id,
          returnedQuantity: update.quantity,
        })),
      },
      level: "INFO",
    });

    return serializeBooking(updatedBooking as Awaited<ReturnType<typeof prisma.booking.findUnique>>);
  });
}

export async function cancelBooking(bookingId: string): Promise<BookingDTO> {
  const user = await requireOrganizationContext();

  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: { id: bookingId, organizationId: user.organizationId! },
      include: { bookingItems: true },
    });

    if (!booking) {
      throw new Error("Booking not found.");
    }

    if (booking.status === "CANCELLED") {
      throw new Error("Booking is already cancelled.");
    }

    const restoreActions = (booking.bookingItems as any[]).map((item: any) => {
      const outstanding = item.quantity - item.returnedQuantity;
      if (outstanding <= 0) {
        return null;
      }

      return tx.inventoryItem.update({
        where: { id: item.inventoryItemId },
        data: {
          availableQuantity: { increment: outstanding },
          rentedQuantity: { decrement: outstanding },
        },
      });
    });

    await Promise.all(restoreActions.filter(Boolean));

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
      include: {
        customer: true,
        bookingItems: { include: { inventoryItem: true } },
      },
    });

    await logActivity({
      tx,
      organizationId: user.organizationId!,
      userId: user.id,
      bookingId,
      action: "Cancel booking",
      entity: "Booking",
      entityId: bookingId,
      details: { reason: "User cancelled booking" },
      level: "WARNING",
    });

    return serializeBooking(updatedBooking as Awaited<ReturnType<typeof prisma.booking.findUnique>>);
  });
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: string,
): Promise<BookingDTO> {
  const user = await requireOrganizationContext();

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, organizationId: user.organizationId! },
    include: { bookingItems: true },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.status === newStatus) {
    return serializeBooking(booking as Awaited<ReturnType<typeof prisma.booking.findUnique>>);
  }

  return prisma.$transaction(async (tx) => {
    // 1. Transitioning to a state where items are returned / cancelled
    if (newStatus === "COMPLETED" || newStatus === "CANCELLED") {
      // Restore inventory for any outstanding rented items
      for (const item of booking.bookingItems) {
        const outstanding = item.quantity - item.returnedQuantity;
        if (outstanding > 0) {
          // If completing, mark all items as fully returned
          if (newStatus === "COMPLETED") {
            await tx.bookingItem.update({
              where: { id: item.id },
              data: { returnedQuantity: item.quantity },
            });
          }

          // Restore available and decrement rented quantity
          await tx.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: {
              availableQuantity: { increment: outstanding },
              rentedQuantity: { decrement: outstanding },
            },
          });
        }
      }
    }
    // 2. Transitioning FROM a returned/cancelled state BACK to an active state
    else if (
      (booking.status === "COMPLETED" || booking.status === "CANCELLED") &&
      (newStatus === "PENDING" || newStatus === "CONFIRMED" || newStatus === "IN_PROGRESS")
    ) {
      // Re-reserve items: check availability and decrement availableQuantity / increment rentedQuantity
      for (const item of booking.bookingItems) {
        const outstanding = item.quantity - item.returnedQuantity;
        
        // If moving back from COMPLETED, reset returned quantities
        if (booking.status === "COMPLETED") {
          await tx.bookingItem.update({
            where: { id: item.id },
            data: { returnedQuantity: 0 },
          });
        }

        // Decrement available and increment rented quantity (representing holding items again)
        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            availableQuantity: { decrement: item.quantity },
            rentedQuantity: { increment: item.quantity },
          },
        });
      }
    }

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: newStatus as any },
      include: {
        customer: true,
        bookingItems: { include: { inventoryItem: true } },
      },
    });

    await logActivity({
      tx,
      organizationId: user.organizationId!,
      userId: user.id,
      bookingId,
      action: "Update booking status",
      entity: "Booking",
      entityId: bookingId,
      details: { from: booking.status, to: newStatus },
      level: "INFO",
    });

    return serializeBooking(updated as Awaited<ReturnType<typeof prisma.booking.findUnique>>);
  });
}
