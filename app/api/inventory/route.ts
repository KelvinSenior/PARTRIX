import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, prismaErrorCode, validationError } from "@/lib/apiErrors";
import {
  inventoryFiltersSchema,
  inventoryItemPayloadSchema,
} from "@/lib/inventoryValidation";
import {
  createInventoryItem,
  listInventoryItems,
} from "@/services/inventory";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return apiError("You must be signed in to manage inventory.", 401);
  }

  const searchParams = Object.fromEntries(new URL(request.url).searchParams);
  const filters = inventoryFiltersSchema.safeParse(searchParams);

  if (!filters.success) {
    return validationError(filters.error);
  }

  const result = await listInventoryItems(filters.data);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return apiError("You must be signed in to manage inventory.", 401);
  }

  const body = await request.json().catch(() => null);
  const payload = inventoryItemPayloadSchema.safeParse(body);

  if (!payload.success) {
    return validationError(payload.error);
  }

  try {
    const item = await createInventoryItem(payload.data);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (prismaErrorCode(error) === "P2002") {
      return apiError("An inventory item with this SKU already exists.", 409);
    }

    return apiError("Inventory item could not be created.", 500);
  }
}

