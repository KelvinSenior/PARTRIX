import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, validationError } from "@/lib/apiErrors";
import { customerPayloadSchema } from "@/lib/customerValidation";
import { listCustomers, createCustomer } from "@/services/customer";

const customerListSchema = z.object({
  q: z.string().trim().optional(),
  sortBy: z
    .enum(["createdAt", "firstName", "lastName", "email", "company"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const parsed = customerListSchema.safeParse(params);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const result = await listCustomers({
    query: parsed.data.q,
    sortBy: parsed.data.sortBy,
    order: parsed.data.order,
    limit: parsed.data.limit,
    offset: parsed.data.offset,
  });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const body = await request.json().catch(() => null);
  const payload = customerPayloadSchema.safeParse(body);

  if (!payload.success) {
    return validationError(payload.error);
  }

  try {
    const customer = await createCustomer(payload.data);
    return NextResponse.json({ customer }, { status: 201 });
  } catch (err) {
    return apiError((err as Error).message ?? "Could not create customer.", 500);
  }
}
