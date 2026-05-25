import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, prismaErrorCode, validationError } from "@/lib/apiErrors";
import { inventoryItemPayloadSchema } from "@/lib/inventoryValidation";
import {
  deleteInventoryItem,
  getInventoryItem,
  updateInventoryItem,
} from "@/services/inventory";

const idSchema = z.string().uuid();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return apiError("You must be signed in to manage inventory.", 401);
  }

  const { id } = await context.params;
  const validId = idSchema.safeParse(id);
  if (!validId.success) {
    return apiError("Invalid inventory item id.", 400);
  }

  const item = await getInventoryItem(validId.data);
  if (!item) {
    return apiError("Inventory item was not found.", 404);
  }

  return NextResponse.json({ item });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return apiError("You must be signed in to manage inventory.", 401);
  }

  const { id } = await context.params;
  const validId = idSchema.safeParse(id);
  if (!validId.success) {
    return apiError("Invalid inventory item id.", 400);
  }

  const body = await request.json().catch(() => null);
  const payload = inventoryItemPayloadSchema.safeParse(body);

  if (!payload.success) {
    return validationError(payload.error);
  }

  try {
    const item = await updateInventoryItem(validId.data, payload.data);
    return NextResponse.json({ item });
  } catch (error) {
    const code = prismaErrorCode(error);
    if (code === "P2025") {
      return apiError("Inventory item was not found.", 404);
    }
    if (code === "P2002") {
      return apiError("An inventory item with this SKU already exists.", 409);
    }

    return apiError("Inventory item could not be updated.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return apiError("You must be signed in to manage inventory.", 401);
  }

  const { id } = await context.params;
  const validId = idSchema.safeParse(id);
  if (!validId.success) {
    return apiError("Invalid inventory item id.", 400);
  }

  try {
    await deleteInventoryItem(validId.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    const code = prismaErrorCode(error);
    if (code === "P2025") {
      return apiError("Inventory item was not found.", 404);
    }
    if (code === "P2003") {
      return apiError(
        "This item is linked to existing records and cannot be deleted.",
        409,
      );
    }

    return apiError("Inventory item could not be deleted.", 500);
  }
}

