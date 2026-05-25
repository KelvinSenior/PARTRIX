import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { getFinanceSummary, getCustomerDebts } from "@/services/finance";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const url = new URL(request.url);
  const start = url.searchParams.get("start") ? new Date(url.searchParams.get("start") as string) : undefined;
  const end = url.searchParams.get("end") ? new Date(url.searchParams.get("end") as string) : undefined;

  try {
    const summary = await getFinanceSummary(start, end);
    const debts = await getCustomerDebts();
    return NextResponse.json({ summary, debts });
  } catch (err) {
    return apiError((err as Error).message ?? "Could not produce finance report.", 500);
  }
}