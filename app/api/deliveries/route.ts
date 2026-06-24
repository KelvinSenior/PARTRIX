import { NextResponse } from "next/server";
import { deliveryPayloadSchema } from "@/lib/deliveryValidation";
import { createDelivery, listDeliveries } from "@/services/delivery";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, validationError } from "@/lib/apiErrors";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  try {
    const items = await listDeliveries();
    return NextResponse.json({ deliveries: items });
  } catch (err: any) {
    return apiError(err.message ?? "Failed to list deliveries.", 500);
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const body = await request.json().catch(() => null);
  const parsed = deliveryPayloadSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const created = await createDelivery(parsed.data);
    return NextResponse.json({ delivery: created }, { status: 201 });
  } catch (err: any) {
    return apiError(err.message ?? "Failed to create delivery.", 500);
  }
}
