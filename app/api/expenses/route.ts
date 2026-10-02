import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiErrorFromException } from "@/lib/apiErrors";
import { expensePayloadSchema } from "@/lib/financeValidation";
import { hasPermission } from "@/lib/rolePolicy";
import { recordExpense, listExpenses } from "@/services/finance";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);
  if (!hasPermission(user.role, "expenses:read")) return apiError("You do not have permission to view expenses.", 403);

  const url = new URL(request.url);
  const start = url.searchParams.get("start") ? new Date(url.searchParams.get("start") as string) : undefined;
  const end = url.searchParams.get("end") ? new Date(url.searchParams.get("end") as string) : undefined;

  const expenses = await listExpenses(start, end);
  return NextResponse.json({ expenses });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid JSON payload", 400);
  const parsed = expensePayloadSchema.safeParse(body);
  if (!parsed.success) return apiError("Invalid expense data.", 400, { fields: parsed.error.flatten().fieldErrors });

  try {
    const expense = await recordExpense(parsed.data, user.id);
    return NextResponse.json({ expense }, { status: 201 });
  } catch (err) {
    return apiErrorFromException(err, "Could not record expense.");
  }
}