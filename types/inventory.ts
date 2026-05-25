export const inventoryStatuses = [
  "AVAILABLE",
  "MAINTENANCE",
  "OUT_OF_STOCK",
  "RETIRED",
] as const;

export type InventoryStatus = (typeof inventoryStatuses)[number];

export const inventoryAvailabilityFilters = [
  "all",
  "available",
  "rented",
  "damaged",
  "low_stock",
  "out_of_stock",
] as const;

export type InventoryAvailabilityFilter =
  (typeof inventoryAvailabilityFilters)[number];

export const inventorySortOptions = [
  "newest",
  "name",
  "available",
  "category",
] as const;

export type InventorySortOption = (typeof inventorySortOptions)[number];

export type StockState =
  | "available"
  | "low_stock"
  | "out_of_stock"
  | "damaged"
  | "maintenance"
  | "retired";

export interface InventoryItemDTO {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  rentalPrice: number;
  costPrice: number;
  damageFee: number;
  imageUrl: string | null;
  totalQuantity: number;
  availableQuantity: number;
  rentedQuantity: number;
  damagedQuantity: number;
  minimumThreshold: number;
  status: InventoryStatus;
  stockState: StockState;
  utilizationRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventorySummary {
  totalItems: number;
  totalOwned: number;
  totalAvailable: number;
  totalRented: number;
  totalDamaged: number;
  lowStockItems: number;
}

export interface InventoryListResponse {
  items: InventoryItemDTO[];
  categories: string[];
  summary: InventorySummary;
}

export interface InventoryListFilters {
  search: string;
  category: string;
  status: "all" | InventoryStatus;
  availability: InventoryAvailabilityFilter;
  sort: InventorySortOption;
}

