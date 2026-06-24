import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, validationError } from "@/lib/apiErrors";
import { deliveryUpdateSchema } from "@/lib/deliveryValidation";
import { getDelivery, updateDelivery } from "@/services/delivery";
import { z } from "zod";

const idSchema = z.string().uuid({ message: "Invalid delivery ID." });

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return apiError(parsedId.error.issues[0].message, 400);

  const delivery = await getDelivery(parsedId.data);
  if (!delivery) return apiError("Delivery not found.", 404);

  return NextResponse.json({ delivery });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return apiError(parsedId.error.issues[0].message, 400);

  const body = await request.json().catch(() => null);
  const parsed = deliveryUpdateSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const updated = await updateDelivery(parsedId.data, parsed.data as any);
    return NextResponse.json({ delivery: updated });
  } catch (err: any) {
    return apiError(err.message ?? "Failed to update delivery.", 500);
  }
}
