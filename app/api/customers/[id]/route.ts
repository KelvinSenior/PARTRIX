import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, validationError } from "@/lib/apiErrors";
import { customerPayloadSchema } from "@/lib/customerValidation";
import { getCustomer, updateCustomer, deleteCustomer } from "@/services/customer";

const idSchema = z.string().uuid({ message: "Invalid customer ID." });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return apiError(parsedId.error.issues[0].message, 400);

  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const customer = await getCustomer(parsedId.data);
  if (!customer) return apiError("Customer not found.", 404);

  return NextResponse.json({ customer });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return apiError(parsedId.error.issues[0].message, 400);

  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const body = await request.json().catch(() => null);
  const payload = customerPayloadSchema.safeParse(body);

  if (!payload.success) {
    return validationError(payload.error);
  }

  try {
    const customer = await updateCustomer(parsedId.data, payload.data);
    return NextResponse.json({ customer });
  } catch (err) {
    if ((err as any).code === "P2025") {
      return apiError("Customer not found.", 404);
    }
    return apiError((err as Error).message ?? "Could not update customer.", 500);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return apiError(parsedId.error.issues[0].message, 400);

  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const deleted = await deleteCustomer(parsedId.data);
  if (!deleted) return apiError("Customer not found or could not be deleted.", 404);

  return NextResponse.json({ success: true });
}
