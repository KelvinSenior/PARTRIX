import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiErrorFromException } from "@/lib/apiErrors";
import { parseFinanceDateRange, paymentPayloadSchema } from "@/lib/financeValidation";
import { hasPermission } from "@/lib/rolePolicy";
import { recordPayment, listPayments } from "@/services/finance";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);
  if (!hasPermission(user.role, "finance:read")) return apiError("You do not have permission to view payments.", 403);

  const url = new URL(request.url);
  const range = parseFinanceDateRange(url.searchParams.get("start"), url.searchParams.get("end"));
  if (!range.success) return apiError("Invalid date range.", 400, { fields: range.error.flatten().fieldErrors });

  const payments = await listPayments(range.start, range.end);
  return NextResponse.json({ payments });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid JSON payload", 400);
  const parsed = paymentPayloadSchema.safeParse(body);
  if (!parsed.success) return apiError("Invalid payment data.", 400, { fields: parsed.error.flatten().fieldErrors });

  try {
    const payment = await recordPayment(parsed.data, user.id);
    return NextResponse.json({ payment }, { status: 201 });
  } catch (err) {
    return apiErrorFromException(err, "Could not record payment.");
  }
}
