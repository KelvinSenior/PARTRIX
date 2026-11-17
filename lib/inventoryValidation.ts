import { z } from "zod";
import {
  inventoryAvailabilityFilters,
  inventorySortOptions,
  inventoryStatuses,
} from "@/types/inventory";

const money = z.coerce.number().min(0).max(999999999.99);
const quantity = z.coerce.number().int().min(0).max(100000);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null);

const optionalImageUrl = optionalText(5_000_000);
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, "Enter a valid calendar date.");

export const inventoryItemPayloadSchema = z
  .object({
    sku: z.string().trim().min(1).max(64),
    name: z.string().trim().min(1).max(140),
    description: optionalText(1000),
    category: optionalText(80),
    rentalPrice: money,
    costPrice: money,
    damageFee: money,
    imageUrl: optionalImageUrl,
    totalQuantity: quantity,
    rentedQuantity: quantity,
    damagedQuantity: quantity,
    minimumThreshold: quantity,
    status: z.enum(inventoryStatuses).default("AVAILABLE"),
  })
  .superRefine((value, context) => {
    if (value.rentedQuantity + value.damagedQuantity > value.totalQuantity) {
      context.addIssue({
        code: "custom",
        path: ["totalQuantity"],
        message: "Rented and damaged quantities cannot exceed total owned.",
      });
    }
  })
  .transform((value) => ({
    ...value,
    sku: value.sku.toUpperCase(),
    availableQuantity:
      value.totalQuantity - value.rentedQuantity - value.damagedQuantity,
  }));

export const inventoryFiltersSchema = z
  .object({
    search: z.string().trim().optional().default(""),
    category: z.string().trim().optional().default("all"),
    status: z
      .union([z.literal("all"), z.enum(inventoryStatuses)])
      .optional()
      .default("all"),
    availability: z
      .enum(inventoryAvailabilityFilters)
      .optional()
      .default("all"),
    sort: z.enum(inventorySortOptions).optional().default("newest"),
    eventDate: dateOnly.optional(),
    deliveryDate: dateOnly.optional(),
    returnDate: dateOnly.optional(),
  })
  .superRefine((value, context) => {
    if (!value.eventDate && (value.deliveryDate || value.returnDate)) {
      context.addIssue({
        code: "custom",
        path: ["eventDate"],
        message: "Choose an event date before setting a rental period.",
      });
    }

    if (value.eventDate && value.returnDate && value.returnDate < value.eventDate) {
      context.addIssue({
        code: "custom",
        path: ["returnDate"],
        message: "Return date must be on or after the event date.",
      });
    }

    if (value.eventDate && value.deliveryDate && value.deliveryDate > value.eventDate) {
      context.addIssue({
        code: "custom",
        path: ["deliveryDate"],
        message: "Delivery date must be on or before the event date.",
      });
    }

    if (value.returnDate && value.deliveryDate && value.returnDate < value.deliveryDate) {
      context.addIssue({
        code: "custom",
        path: ["returnDate"],
        message: "Return date must be on or after the delivery date.",
      });
    }
  })
  .transform((value) => ({
    ...value,
    category: value.category || "all",
  }));

export type InventoryItemPayload = z.infer<typeof inventoryItemPayloadSchema>;
export type InventoryFiltersPayload = z.infer<typeof inventoryFiltersSchema>;

