import type { BookingPayload, BookingDTO, BookingListResponse, BookingReturnPayload, BookingStatus } from "@/types/booking";
import type { Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { getOrganizationSettings } from "@/services/settings";
import { logActivity } from "@/services/audit";
import { createNotification } from "@/services/notification";

const activeBookingStatuses: BookingStatus[] = ["PENDING", "CONFIRMED", "IN_PROGRESS"];

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

function toCents(value: number | string | { toString: () => string }): number {
  const normalized = typeof value === "object" ? value.toString() : String(value);
  const match = normalized.match(/^(-?)(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) throw new Error("Monetary values must have at most two decimal places.");
  const fraction = Number((match[3] ?? "").padEnd(2, "0"));
  const cents = Number(match[2]) * 100 + fraction;
  return match[1] ? -cents : cents;
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
  excludeBookingId?: string,
) {
  const bookings = await tx.bookingItem.findMany({
    where: {
      inventoryItemId: { in: itemIds },
      booking: {
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
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
      returnedQuantity: true,
    },
  });

  return bookings.reduce((acc: Record<string, number>, item: { inventoryItemId: string; quantity: number; returnedQuantity: number }) => {
    acc[item.inventoryItemId] = (acc[item.inventoryItemId] ?? 0) + Math.max(0, item.quantity - item.returnedQuantity);
    return acc;
  }, {} as Record<string, number>);
}

async function runSerializable<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
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
  throw new Error("Booking transaction could not be completed.");
}

async function computeBookingTotals(
  payload: BookingPayload,
  inventoryData: Array<{ id: string; unitPrice: string }>,
  depositPercent: number,
) {
  const itemTotals = payload.items.map((item) => {
    const inventory = inventoryData.find((record) => record.id === item.inventoryItemId);
    const unitPriceCents = inventory ? toCents(inventory.unitPrice) : 0;
    const discountCents = toCents(item.discount);
    const unitPrice = unitPriceCents / 100;
    return {
      ...item,
      unitPrice,
      totalPrice: Math.max(unitPriceCents * item.quantity - discountCents, 0) / 100,
    };
  });

  const itemSumCents = itemTotals.reduce((sum, item) => sum + toCents(item.totalPrice), 0);
  const totalCents = Math.max(0,
    itemSumCents + toCents(payload.deliveryFee) + toCents(payload.setupFee) - toCents(payload.discount),
  );
  const depositCents = Math.round((totalCents * depositPercent) / 100);

  return {
    itemTotals,
    total: totalCents / 100,
    deposit: depositCents / 100,
    balance: (totalCents + depositCents) / 100,
  };
}

export async function createBooking(payload: BookingPayload): Promise<BookingDTO> {
  const user = await requirePermission("bookings:create");
  const settings = await getOrganizationSettings();
  const depositPercent = settings.deposit.requiredDepositPercent;
  const organizationId = user.organizationId!;

  const createdBooking = await runSerializable(async (tx) => {
    const eventDate = new Date(payload.eventDate);
    const returnDate = payload.returnDate ? new Date(payload.returnDate) : eventDate;
    const itemIds = payload.items.map((item) => item.inventoryItemId);

    const inventoryItems = await tx.inventoryItem.findMany({
      where: { id: { in: itemIds }, organizationId },
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
        organization: { connect: { id: organizationId } },
        inventoryItem: { connect: { id: inventoryItem.id } },
        quantity: item.quantity,
        unitPrice: inventoryItem.unitPrice.toString(),
        discount: item.discount.toString(),
        totalPrice: Math.max(toCents(inventoryItem.unitPrice) * item.quantity - toCents(item.discount), 0) / 100,
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
        organization: { connect: { id: organizationId } },
        bookingNumber: formatBookingNumber(),
        customer: await findOrCreateCustomer(payload.customer, tx, organizationId),
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

    return {
      booking: booking as Awaited<ReturnType<typeof prisma.booking.findUnique>>,
      totals,
    };
  });

  if (!createdBooking?.booking) {
    throw new Error("Booking creation failed.");
  }

  await logActivity({
    organizationId,
    userId: user.id,
    bookingId: createdBooking.booking.id,
    action: "Create booking",
    entity: "Booking",
    entityId: createdBooking.booking.id,
    details: {
      bookingNumber: createdBooking.booking.bookingNumber,
      totalAmount: decimalToNumber(createdBooking.booking.totalAmount),
      depositAmount: decimalToNumber(createdBooking.booking.depositAmount),
    },
    level: "INFO",
  });

  await createNotification({
    organizationId,
    userId: user.id,
    type: "BOOKING",
    priority: "SUCCESS",
    title: "Booking created",
    message: `${createdBooking.booking.bookingNumber} was created for ${payload.customer.firstName ?? "the customer"} ${payload.customer.lastName ?? ""}`.trim() + ".",
    href: `/bookings/${createdBooking.booking.id}`,
    entity: "Booking",
    entityId: createdBooking.booking.id,
    metadata: { bookingNumber: createdBooking.booking.bookingNumber, totalAmount: createdBooking.totals.total },
  });

  return serializeBooking(createdBooking.booking as Awaited<ReturnType<typeof prisma.booking.findUnique>>);
}

export async function listBookings(opts?: {
  search?: string;
  status?: string;
}): Promise<BookingListResponse> {
  const user = await requirePermission("bookings:read");

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

export async function countActiveBookings() {
  const user = await requirePermission("bookings:read");
  return prisma.booking.count({
    where: {
      organizationId: user.organizationId!,
      status: { in: activeBookingStatuses },
    },
  });
}

export async function getBooking(id: string): Promise<BookingDTO | null> {
  const user = await requirePermission("bookings:read");
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
  const user = await requirePermission("bookings:return");
  const settings = await getOrganizationSettings();

  const result = await runSerializable(async (tx) => {
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

    const returnItemIds = payload.returnItems.map((item) => item.bookingItemId);
    if (new Set(returnItemIds).size !== returnItemIds.length) {
      throw new Error("A booking item can only appear once in a return.");
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

    if (!settings.rental.allowPartialReturns) {
      const returnedByItem = new Map<string, number>();
      for (const update of updates) {
        returnedByItem.set(update.bookingItem.id, (returnedByItem.get(update.bookingItem.id) ?? 0) + update.quantity);
      }

      const returnsEverything = (booking.bookingItems as any[]).every((item: any) => {
        const submittedQuantity = returnedByItem.get(item.id) ?? 0;
        return item.returnedQuantity + submittedQuantity >= item.quantity;
      });

      if (!returnsEverything) {
        throw new Error("Partial returns are disabled in workspace settings. Return all outstanding items together.");
      }
    }

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

  await createNotification({
    organizationId: user.organizationId!,
    userId: user.id,
    type: "INVENTORY",
    priority: result.status === "COMPLETED" ? "SUCCESS" : "INFO",
    title: result.status === "COMPLETED" ? "Booking returned" : "Items returned",
    message: result.status === "COMPLETED"
      ? `All items for ${result.bookingNumber} have been returned.`
      : `A return was recorded for ${result.bookingNumber}.`,
    href: `/bookings/${bookingId}`,
    entity: "Booking",
    entityId: bookingId,
    metadata: { returnItems: payload.returnItems.length },
  });
  return result;
}

export async function updateBookingItems(
  bookingId: string,
  changes: {
    items: Array<{ bookingItemId?: string; inventoryItemId: string; quantity: number; discount?: number; notes?: string | null }>;
    eventDate?: string;
    returnDate?: string | null;
  },
): Promise<BookingDTO> {
  const user = await requirePermission("bookings:update");
  const settings = await getOrganizationSettings();
  const organizationId = user.organizationId!;

  return runSerializable(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: { id: bookingId, organizationId },
      include: { bookingItems: true },
    });

    if (!booking) {
      throw new Error("Booking not found.");
    }

    if (booking.status !== "PENDING") {
      throw new Error("This booking can no longer be edited.");
    }

    const bookingItemMap = new Map((booking.bookingItems as any[]).map((item: any) => [item.id, item]));
    const submittedItemIds = changes.items.map((item) => item.inventoryItemId);
    const submittedBookingItemIds = changes.items.flatMap((item) => item.bookingItemId ? [item.bookingItemId] : []);
    if (new Set(submittedItemIds).size !== submittedItemIds.length || new Set(submittedBookingItemIds).size !== submittedBookingItemIds.length) {
      throw new Error("A booking item can only appear once.");
    }

    const updatedEventDate = changes.eventDate ? new Date(changes.eventDate) : booking.eventDate;
    const updatedReturnDate = changes.returnDate === undefined
      ? booking.returnDate
      : changes.returnDate ? new Date(changes.returnDate) : null;
    if (updatedReturnDate && updatedReturnDate < updatedEventDate) {
      throw new Error("Return date must be on or after the event date.");
    }
    const reservationEnd = updatedReturnDate ?? updatedEventDate;

    const inventoryIds = [...new Set([
      ...submittedItemIds,
      ...(booking.bookingItems as any[]).map((item: any) => item.inventoryItemId),
    ])];
    const inventoryItems = await tx.inventoryItem.findMany({
      where: { id: { in: inventoryIds }, organizationId },
    });
    if (inventoryItems.length !== inventoryIds.length) {
      throw new Error("One or more inventory items are invalid.");
    }
    const inventoryById = new Map(inventoryItems.map((item: any) => [item.id, item]));
    const reservedAmounts = await getOverlappingReservedQuantities(
      submittedItemIds,
      updatedEventDate,
      reservationEnd,
      tx,
      bookingId,
    );

    const itemChanges = changes.items.map((change) => {
      const existing = change.bookingItemId ? bookingItemMap.get(change.bookingItemId) : null;
      if (change.bookingItemId && !existing) throw new Error("One or more booking items are invalid.");
      if (existing && existing.returnedQuantity > 0) throw new Error("Returned booking items cannot be edited.");

      const inventoryItem = inventoryById.get(change.inventoryItemId) as any;
      if (!inventoryItem) throw new Error("Inventory item not found.");
      const addedQuantity = change.quantity - (existing?.inventoryItemId === change.inventoryItemId ? existing.quantity : 0);
      if (addedQuantity > 0 && inventoryItem.status !== "AVAILABLE") {
        throw new Error(`"${inventoryItem.name}" is not available for booking.`);
      }

      const reservedQuantity = reservedAmounts[change.inventoryItemId] ?? 0;
      const availableForPeriod = inventoryItem.totalQuantity - reservedQuantity;
      if (change.quantity > availableForPeriod) {
        throw new Error(`Insufficient availability for ${inventoryItem.name}. Only ${availableForPeriod} unit(s) are available for these dates.`);
      }

      const unitPrice = existing?.inventoryItemId === change.inventoryItemId
        ? Number(existing.unitPrice.toString())
        : Number(inventoryItem.unitPrice.toString());
      const unitPriceCents = Math.round(unitPrice * 100);
      const discount = change.discount ?? (existing ? Number(existing.discount.toString()) : 0);
      const discountCents = Math.round(discount * 100);
      const subtotalCents = unitPriceCents * change.quantity;
      if (discountCents > subtotalCents) throw new Error("Item discount cannot exceed its subtotal.");

      return {
        existing,
        inventoryItem,
        inventoryItemId: change.inventoryItemId,
        quantity: change.quantity,
        unitPriceCents,
        discountCents,
        totalPriceCents: subtotalCents - discountCents,
        notes: change.notes === undefined ? existing?.notes ?? null : change.notes,
      };
    });

    const requestedByInventory = new Map<string, number>();
    for (const item of itemChanges) requestedByInventory.set(item.inventoryItemId, item.quantity);
    const quantityDeltas = new Map<string, number>();
    for (const item of booking.bookingItems as any[]) {
      quantityDeltas.set(item.inventoryItemId, (quantityDeltas.get(item.inventoryItemId) ?? 0) - item.quantity);
    }
    for (const item of itemChanges) {
      quantityDeltas.set(item.inventoryItemId, (quantityDeltas.get(item.inventoryItemId) ?? 0) + item.quantity);
    }

    for (const [inventoryItemId, delta] of quantityDeltas) {
      if (!delta) continue;
      await tx.inventoryItem.update({
        where: { id: inventoryItemId },
        data: {
          availableQuantity: { decrement: delta },
          rentedQuantity: { increment: delta },
        },
      });
    }

    const retainedBookingItemIds = new Set(itemChanges.flatMap((item) => item.existing ? [item.existing.id] : []));
    for (const oldItem of booking.bookingItems as any[]) {
      if (!retainedBookingItemIds.has(oldItem.id)) {
        await tx.bookingItem.delete({ where: { id: oldItem.id } });
      }
    }
    for (const item of itemChanges) {
      const data = {
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity,
        unitPrice: (item.unitPriceCents / 100).toFixed(2),
        discount: (item.discountCents / 100).toFixed(2),
        totalPrice: (item.totalPriceCents / 100).toFixed(2),
        notes: item.notes,
      };
      if (item.existing) {
        await tx.bookingItem.update({ where: { id: item.existing.id }, data });
      } else {
        await tx.bookingItem.create({
          data: { organizationId, bookingId, ...data },
        });
      }
    }

    const itemTotalCents = itemChanges.reduce((sum, item) => sum + item.totalPriceCents, 0);
    const deliveryFeeCents = Math.round(Number(booking.deliveryFee.toString()) * 100);
    const setupFeeCents = Math.round(Number(booking.setupFee.toString()) * 100);
    const bookingDiscountCents = Math.round(Number(booking.discount.toString()) * 100);
    const totalCents = Math.max(0, itemTotalCents + deliveryFeeCents + setupFeeCents - bookingDiscountCents);
    const depositCents = Math.round(totalCents * settings.deposit.requiredDepositPercent / 100);
    const oldDepositCents = Math.round(Number(booking.depositAmount.toString()) * 100);
    const depositPaidCents = Math.round(Number(booking.depositPaid.toString()) * 100);
    const oldDepositOutstandingCents = Math.max(0, oldDepositCents - depositPaidCents);
    const oldRentalOutstandingCents = Math.max(0, Math.round(Number(booking.balanceDue.toString()) * 100) - oldDepositOutstandingCents);
    const rentalPaidCents = Math.max(0, Math.round(Number(booking.totalAmount.toString()) * 100) - oldRentalOutstandingCents);
    const nextDepositOutstandingCents = Math.max(0, depositCents - depositPaidCents);
    const nextRentalOutstandingCents = Math.max(0, totalCents - rentalPaidCents);
    const balanceDueCents = nextDepositOutstandingCents + nextRentalOutstandingCents;

    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        ...(changes.eventDate ? { eventDate: updatedEventDate } : {}),
        ...(changes.returnDate !== undefined ? { returnDate: updatedReturnDate } : {}),
        totalAmount: (totalCents / 100).toFixed(2),
        depositAmount: (depositCents / 100).toFixed(2),
        balanceDue: (balanceDueCents / 100).toFixed(2),
        depositStatus: nextDepositOutstandingCents > 0 ? "PENDING" : "PAID",
      },
      include: {
        customer: true,
        bookingItems: { include: { inventoryItem: true } },
      },
    });

    return serializeBooking(updatedBooking as Awaited<ReturnType<typeof prisma.booking.findUnique>>);
  });
}

export async function cancelBooking(bookingId: string): Promise<BookingDTO> {
  const user = await requirePermission("bookings:cancel");

  const result = await runSerializable(async (tx) => {
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

  await createNotification({
    organizationId: user.organizationId!,
    userId: user.id,
    type: "BOOKING",
    priority: "WARNING",
    title: "Booking cancelled",
    message: `${result.bookingNumber} was cancelled and outstanding inventory was released.`,
    href: `/bookings/${bookingId}`,
    entity: "Booking",
    entityId: bookingId,
    metadata: { bookingNumber: result.bookingNumber },
  });
  return result;
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
): Promise<BookingDTO> {
  const user = await requirePermission("bookings:status");

  const transactionResult = await runSerializable(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: { id: bookingId, organizationId: user.organizationId! },
      include: { bookingItems: true },
    });
    if (!booking) throw new Error("Booking not found.");
    if (booking.status === newStatus) {
      return { booking: serializeBooking(booking as Awaited<ReturnType<typeof prisma.booking.findUnique>>), changed: false };
    }

    const wasActive = activeBookingStatuses.includes(booking.status);
    if (newStatus === "COMPLETED" || newStatus === "CANCELLED") {
      for (const item of booking.bookingItems) {
        const outstanding = item.quantity - item.returnedQuantity;
        if (outstanding > 0) {
          if (newStatus === "COMPLETED") {
            await tx.bookingItem.update({
              where: { id: item.id },
              data: { returnedQuantity: item.quantity },
            });
          }

          if (wasActive) {
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
    } else if (
      (booking.status === "COMPLETED" || booking.status === "CANCELLED") &&
      activeBookingStatuses.includes(newStatus)
    ) {
      const itemIds = booking.bookingItems.map((item) => item.inventoryItemId);
      const reservationEnd = booking.returnDate ?? booking.eventDate;
      const reservedAmounts = await getOverlappingReservedQuantities(itemIds, booking.eventDate, reservationEnd, tx, bookingId);
      const inventoryItems = await tx.inventoryItem.findMany({
        where: { id: { in: itemIds }, organizationId: user.organizationId! },
      });
      const inventoryById = new Map(inventoryItems.map((item) => [item.id, item]));

      for (const item of booking.bookingItems) {
        const outstanding = booking.status === "COMPLETED" ? item.quantity : item.quantity - item.returnedQuantity;
        if (outstanding <= 0) continue;
        const inventoryItem = inventoryById.get(item.inventoryItemId);
        if (!inventoryItem || inventoryItem.status !== "AVAILABLE") {
          throw new Error("One or more inventory items are no longer available.");
        }
        const reserved = reservedAmounts[item.inventoryItemId] ?? 0;
        if (outstanding > inventoryItem.totalQuantity - reserved) {
          throw new Error(`Insufficient availability for ${inventoryItem.name}.`);
        }

        if (booking.status === "COMPLETED") {
          await tx.bookingItem.update({
            where: { id: item.id },
            data: { returnedQuantity: 0 },
          });
        }

        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            availableQuantity: { decrement: outstanding },
            rentedQuantity: { increment: outstanding },
          },
        });
      }
    }

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: newStatus },
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

    return {
      booking: serializeBooking(updated as Awaited<ReturnType<typeof prisma.booking.findUnique>>),
      changed: true,
    };
  });

  if (!transactionResult.changed) return transactionResult.booking;

  await createNotification({
    organizationId: user.organizationId!,
    userId: user.id,
    type: "BOOKING",
    priority: newStatus === "COMPLETED" ? "SUCCESS" : newStatus === "CANCELLED" ? "WARNING" : "INFO",
    title: "Booking status updated",
    message: `${transactionResult.booking.bookingNumber} moved to ${newStatus.replace(/_/g, " ")}.`,
    href: `/bookings/${bookingId}`,
    entity: "Booking",
    entityId: bookingId,
    metadata: { status: newStatus },
  });
  return transactionResult.booking;
}
