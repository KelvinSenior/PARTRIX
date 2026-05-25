import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, validationError } from "@/lib/apiErrors";
import { recordExpense, listExpenses } from "@/services/finance";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

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

  try {
    const expense = await recordExpense(body, user.id as string);
    return NextResponse.json({ expense }, { status: 201 });
  } catch (err) {
    return apiError((err as Error).message ?? "Could not record expense.", 500);
  }
}