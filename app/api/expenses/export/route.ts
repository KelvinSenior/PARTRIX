import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { hasPermission } from "@/lib/rolePolicy";
import { parseFinanceDateRange } from "@/lib/financeValidation";
import { listExpenses } from "@/services/finance";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);
  if (!hasPermission(user.role, "expenses:read")) return apiError("You do not have permission to export expenses.", 403);

  const url = new URL(request.url);
  const range = parseFinanceDateRange(url.searchParams.get("start"), url.searchParams.get("end"));
  if (!range.success) return apiError("Invalid date range.", 400, { fields: range.error.flatten().fieldErrors });

  const expenses = await listExpenses(range.start, range.end);

  const rows = ["id,bookingId,category,amount,vendor,incurredAt,notes,createdAt"];
  for (const e of expenses) {
    rows.push([e.id, e.bookingId ?? "", e.category, e.amount.toFixed(2), e.vendor ?? "", e.incurredAt, (e.notes ?? "").replace(/\n/g, " "), e.createdAt].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",") );
  }

  const csv = rows.join("\n");
  return new NextResponse(csv, { status: 200, headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=expenses.csv" } });
}
