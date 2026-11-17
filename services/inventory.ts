import type { InventoryItem, Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { createNotification } from "@/services/notification";
import { getOrganizationSettings } from "@/services/settings";
import {
  getCalendarDateStart,
  getInventoryAvailability,
  type InventoryAvailability,
  type RentalAvailabilityWindow,
} from "@/services/inventoryAvailability";
import type { InventoryItemPayload } from "@/lib/inventoryValidation";
import type {
  InventoryItemDTO,
  InventoryListFilters,
  InventoryListResponse,
  InventorySummary,
  StockState,
} from "@/types/inventory";

function decimalToNumber(value: InventoryItem["unitPrice"]) {
  return Number(value.toString());
}

function decimalString(value: number) {
  return value.toFixed(2);
}

function getStockState(item: InventoryItem, periodAvailableQuantity = item.availableQuantity): StockState {
  if (item.status === "RETIRED") {
    return "retired";
  }
  if (item.status === "MAINTENANCE") {
    return "maintenance";
  }
  if (item.totalQuantity - item.damagedQuantity <= 0 && item.damagedQuantity > 0) {
    return "damaged";
  }
  if (periodAvailableQuantity === 0 || item.status === "OUT_OF_STOCK") {
    return "out_of_stock";
  }
  if (
    item.minimumThreshold > 0 &&
    periodAvailableQuantity <= item.minimumThreshold
  ) {
    return "low_stock";
  }
  return "available";
}

function serializeInventoryItem(item: InventoryItem): InventoryItemDTO {
  const utilizationRate =
    item.totalQuantity > 0
      ? Math.round((item.rentedQuantity / item.totalQuantity) * 100)
      : 0;

  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    description: item.description,
    category: item.category,
    rentalPrice: decimalToNumber(item.unitPrice),
    costPrice: decimalToNumber(item.costPrice),
    damageFee: decimalToNumber(item.damageFee),
    imageUrl: item.imageUrl,
    totalQuantity: item.totalQuantity,
    availableQuantity: item.availableQuantity,
    periodAvailableQuantity: item.availableQuantity,
    periodCommittedQuantity: item.rentedQuantity,
    rentedQuantity: item.rentedQuantity,
    damagedQuantity: item.damagedQuantity,
    minimumThreshold: item.minimumThreshold,
    status: item.status,
    stockState: getStockState(item),
    utilizationRate,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function matchesAvailability(
  item: InventoryItemDTO,
  availability: InventoryListFilters["availability"],
) {
  if (availability === "all") {
    return true;
  }
  if (availability === "available") {
    return item.periodAvailableQuantity > 0 && item.status === "AVAILABLE";
  }
  if (availability === "rented") {
    return item.rentedQuantity > 0;
  }
  if (availability === "damaged") {
    return item.damagedQuantity > 0;
  }
  if (availability === "low_stock") {
    return item.stockState === "low_stock";
  }
  return item.periodAvailableQuantity === 0 || item.status === "OUT_OF_STOCK";
}

function buildWhere(filters: InventoryListFilters): Prisma.InventoryItemWhereInput {
  const and: Prisma.InventoryItemWhereInput[] = [];

  if (filters.search) {
    and.push({
      OR: [
        { sku: { contains: filters.search, mode: "insensitive" } },
        { name: { contains: filters.search, mode: "insensitive" } },
        { category: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }

  if (filters.category !== "all") {
    and.push({ category: filters.category });
  }

  if (filters.status !== "all") {
    and.push({ status: filters.status });
  }

  if (filters.availability === "rented") {
    and.push({ rentedQuantity: { gt: 0 } });
  }

  if (filters.availability === "damaged") {
    and.push({ damagedQuantity: { gt: 0 } });
  }

  return and.length ? { AND: and } : {};
}

function getOrderBy(
  sort: InventoryListFilters["sort"],
): Prisma.InventoryItemOrderByWithRelationInput {
  if (sort === "name") {
    return { name: "asc" };
  }
  if (sort === "available") {
    return { name: "asc" };
  }
  if (sort === "category") {
    return { category: "asc" };
  }
  return { createdAt: "desc" };
}

function summarize(items: InventoryItemDTO[]): InventorySummary {
  return items.reduce<InventorySummary>(
    (summary, item) => ({
      totalItems: summary.totalItems + 1,
      totalOwned: summary.totalOwned + item.totalQuantity,
      totalAvailable: summary.totalAvailable + item.periodAvailableQuantity,
      totalCommitted: summary.totalCommitted + item.periodCommittedQuantity,
      totalRented: summary.totalRented + item.rentedQuantity,
      totalDamaged: summary.totalDamaged + item.damagedQuantity,
      lowStockItems:
        summary.lowStockItems + (item.stockState === "low_stock" ? 1 : 0),
    }),
    {
      totalItems: 0,
      totalOwned: 0,
      totalAvailable: 0,
      totalCommitted: 0,
      totalRented: 0,
      totalDamaged: 0,
      lowStockItems: 0,
    },
  );
}

function dateOnly(value: string | undefined, fallback: Date): Date {
  if (!value) return fallback;
  return new Date(`${value}T00:00:00.000Z`);
}

function getAvailabilityWindow(
  filters: Pick<InventoryListFilters, "eventDate" | "deliveryDate" | "returnDate">,
  today: Date,
): RentalAvailabilityWindow {
  const eventDate = dateOnly(filters.eventDate, today);
  return {
    eventDate,
    deliveryDate: filters.deliveryDate ? dateOnly(filters.deliveryDate, today) : null,
    returnDate: filters.returnDate ? dateOnly(filters.returnDate, today) : eventDate,
  };
}

async function serializeWithAvailability(
  item: InventoryItem,
  organizationId: string,
  window: RentalAvailabilityWindow,
  availability?: Map<string, InventoryAvailability>,
  now?: Date,
  timeZone = "UTC",
  includeReservations = false,
): Promise<InventoryItemDTO> {
  const periodAvailability = availability?.get(item.id) ??
    (await getInventoryAvailability(organizationId, [item], window, {
      now,
      timeZone,
      includeReservations,
    })).get(item.id)!;
  const serialized = serializeInventoryItem(item);

  return {
    ...serialized,
    periodAvailableQuantity: periodAvailability.availableQuantity,
    periodCommittedQuantity: periodAvailability.committedQuantity,
    stockState: getStockState(item, periodAvailability.availableQuantity),
  };
}

function toPrismaData(data: InventoryItemPayload) {
  return {
    sku: data.sku,
    name: data.name,
    description: data.description,
    category: data.category,
    unitPrice: decimalString(data.rentalPrice),
    costPrice: decimalString(data.costPrice),
    damageFee: decimalString(data.damageFee),
    imageUrl: data.imageUrl,
    totalQuantity: data.totalQuantity,
    availableQuantity: data.availableQuantity,
    rentedQuantity: data.rentedQuantity,
    damagedQuantity: data.damagedQuantity,
    minimumThreshold: data.minimumThreshold,
    status: data.status,
  };
}

export async function listInventoryItems(
  filters: InventoryListFilters,
): Promise<InventoryListResponse> {
  const user = await requirePermission("inventory:read");
  const organizationId = user.organizationId!;
  const tenantWhere = { organizationId, ...buildWhere(filters) };
  const [records, categoryRows, settings] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: tenantWhere,
      orderBy: filters.sort === "available" ? { name: "asc" } : getOrderBy(filters.sort),
    }),
    prisma.inventoryItem.findMany({
      distinct: ["category"],
      where: { organizationId, category: { not: null } },
      select: { category: true },
      orderBy: { category: "asc" },
    }),
    getOrganizationSettings(),
  ]);
  const now = new Date();
  const timeZone = settings.localization.timeZone;
  const today = getCalendarDateStart(now, timeZone);
  const window = getAvailabilityWindow(filters, today);

  const periodAvailability = await getInventoryAvailability(
    organizationId,
    records,
    window,
    { now, timeZone, includeReservations: Boolean(filters.eventDate) },
  );
  const serializedItems = await Promise.all(records.map((item) =>
    serializeWithAvailability(
      item,
      organizationId,
      window,
      periodAvailability,
      now,
      timeZone,
      Boolean(filters.eventDate),
    ),
  ));
  const filteredItems = serializedItems
    .filter((item) => matchesAvailability(item, filters.availability));
  if (filters.sort === "available") {
    filteredItems.sort((left, right) => left.periodAvailableQuantity - right.periodAvailableQuantity);
  }

  return {
    items: filteredItems,
    categories: categoryRows
      .map((row) => row.category)
      .filter((category): category is string => Boolean(category)),
    summary: summarize(filteredItems),
  };
}

export async function getInventoryItem(id: string) {
  const user = await requirePermission("inventory:read");
  const [item, settings] = await Promise.all([
    prisma.inventoryItem.findFirst({ where: { id, organizationId: user.organizationId! } }),
    getOrganizationSettings(),
  ]);
  const now = new Date();
  return item
    ? serializeWithAvailability(
        item,
        user.organizationId!,
        getAvailabilityWindow({}, getCalendarDateStart(now, settings.localization.timeZone)),
        undefined,
        now,
        settings.localization.timeZone,
      )
    : null;
}

export async function createInventoryItem(data: InventoryItemPayload) {
  const user = await requirePermission("inventory:write");
  const organizationId = user.organizationId!;
  const settings = await getOrganizationSettings();
  const item = await prisma.inventoryItem.create({
    data: { organizationId, ...toPrismaData(data) },
  });
  const now = new Date();
  const serialized = await serializeWithAvailability(
    item,
    organizationId,
    getAvailabilityWindow({}, getCalendarDateStart(now, settings.localization.timeZone)),
    undefined,
    now,
    settings.localization.timeZone,
  );

  if (item.minimumThreshold > 0 && serialized.periodAvailableQuantity <= item.minimumThreshold) {
    await createNotification({
      organizationId,
      userId: user.id,
      type: "INVENTORY",
      priority: "WARNING",
      title: "Low stock warning",
      message: `${item.name} is at or below its minimum stock threshold.`,
      href: "/inventory",
      entity: "InventoryItem",
      entityId: item.id,
      metadata: { sku: item.sku, availableQuantity: serialized.periodAvailableQuantity },
    });
  }

  return serialized;
}

export async function updateInventoryItem(
  id: string,
  data: InventoryItemPayload,
) {
  const user = await requirePermission("inventory:write");
  const existing = await prisma.inventoryItem.findFirst({ where: { id, organizationId: user.organizationId! } });
  if (!existing) {
    throw new Error("Inventory item not found in this workspace.");
  }

  const settings = await getOrganizationSettings();
  const item = await prisma.inventoryItem.update({
    where: { id, organizationId: user.organizationId! },
    data: toPrismaData(data),
  });
  const now = new Date();
  const serialized = await serializeWithAvailability(
    item,
    user.organizationId!,
    getAvailabilityWindow({}, getCalendarDateStart(now, settings.localization.timeZone)),
    undefined,
    now,
    settings.localization.timeZone,
  );

  if (serialized.periodAvailableQuantity === 0 || (item.minimumThreshold > 0 && serialized.periodAvailableQuantity <= item.minimumThreshold)) {
    await createNotification({
      organizationId: user.organizationId!,
      userId: user.id,
      type: "INVENTORY",
      priority: serialized.periodAvailableQuantity === 0 ? "CRITICAL" : "WARNING",
      title: serialized.periodAvailableQuantity === 0 ? "Item unavailable" : "Low stock warning",
      message: `${item.name} has ${serialized.periodAvailableQuantity} available today.`,
      href: "/inventory",
      entity: "InventoryItem",
      entityId: item.id,
      metadata: { sku: item.sku, availableQuantity: serialized.periodAvailableQuantity },
    });
  }

  return serialized;
}

export async function deleteInventoryItem(id: string) {
  const user = await requirePermission("inventory:delete");
  const existing = await prisma.inventoryItem.findFirst({ where: { id, organizationId: user.organizationId! } });
  if (!existing) {
    return;
  }

  await prisma.inventoryItem.deleteMany({ where: { id, organizationId: user.organizationId! } });
}
