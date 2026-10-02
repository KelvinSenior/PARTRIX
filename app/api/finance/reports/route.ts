import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, apiErrorFromException } from "@/lib/apiErrors";
import { hasPermission } from "@/lib/rolePolicy";
import { getFinanceSummary, getCustomerDebts } from "@/services/finance";
import { parseFinanceDateRange } from "@/lib/financeValidation";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);
  if (!hasPermission(user.role, "finance:read")) return apiError("You do not have permission to view financial reports.", 403);

  const url = new URL(request.url);
  const range = parseFinanceDateRange(url.searchParams.get("start"), url.searchParams.get("end"));
  if (!range.success) return apiError("Invalid date range.", 400, { fields: range.error.flatten().fieldErrors });

  try {
    const summary = await getFinanceSummary(range.start, range.end);
    const debts = await getCustomerDebts();
    return NextResponse.json({ summary, debts });
  } catch (err) {
    return apiErrorFromException(err, "Could not produce finance report.");
  }
}