import type { InventoryItem, Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
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

function getStockState(item: InventoryItem): StockState {
  if (item.status === "RETIRED") {
    return "retired";
  }
  if (item.status === "MAINTENANCE") {
    return "maintenance";
  }
  if (item.availableQuantity === 0 && item.damagedQuantity > 0) {
    return "damaged";
  }
  if (item.availableQuantity === 0 || item.status === "OUT_OF_STOCK") {
    return "out_of_stock";
  }
  if (
    item.minimumThreshold > 0 &&
    item.availableQuantity <= item.minimumThreshold
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
    return item.availableQuantity > 0 && item.status === "AVAILABLE";
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
  return item.availableQuantity === 0 || item.status === "OUT_OF_STOCK";
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

  if (filters.availability === "out_of_stock") {
    and.push({
      OR: [{ availableQuantity: 0 }, { status: "OUT_OF_STOCK" }],
    });
  }

  if (filters.availability === "available") {
    and.push({ availableQuantity: { gt: 0 }, status: "AVAILABLE" });
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
    return { availableQuantity: "asc" };
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
      totalAvailable: summary.totalAvailable + item.availableQuantity,
      totalRented: summary.totalRented + item.rentedQuantity,
      totalDamaged: summary.totalDamaged + item.damagedQuantity,
      lowStockItems:
        summary.lowStockItems + (item.stockState === "low_stock" ? 1 : 0),
    }),
    {
      totalItems: 0,
      totalOwned: 0,
      totalAvailable: 0,
      totalRented: 0,
      totalDamaged: 0,
      lowStockItems: 0,
    },
  );
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
  const [records, categoryRows] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: buildWhere(filters),
      orderBy: getOrderBy(filters.sort),
    }),
    prisma.inventoryItem.findMany({
      distinct: ["category"],
      where: { category: { not: null } },
      select: { category: true },
      orderBy: { category: "asc" },
    }),
  ]);

  const items = records
    .map(serializeInventoryItem)
    .filter((item) => matchesAvailability(item, filters.availability));

  return {
    items,
    categories: categoryRows
      .map((row) => row.category)
      .filter((category): category is string => Boolean(category)),
    summary: summarize(items),
  };
}

export async function getInventoryItem(id: string) {
  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  return item ? serializeInventoryItem(item) : null;
}

export async function createInventoryItem(data: InventoryItemPayload) {
  const item = await prisma.inventoryItem.create({
    data: toPrismaData(data),
  });

  return serializeInventoryItem(item);
}

export async function updateInventoryItem(
  id: string,
  data: InventoryItemPayload,
) {
  const item = await prisma.inventoryItem.update({
    where: { id },
    data: toPrismaData(data),
  });

  return serializeInventoryItem(item);
}

export async function deleteInventoryItem(id: string) {
  await prisma.inventoryItem.delete({ where: { id } });
}

