import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { hasPermission } from "@/lib/rolePolicy";
import { parseFinanceDateRange } from "@/lib/financeValidation";
import { listPayments } from "@/services/finance";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);
  if (!hasPermission(user.role, "finance:read")) return apiError("You do not have permission to export payments.", 403);

  const url = new URL(request.url);
  const range = parseFinanceDateRange(url.searchParams.get("start"), url.searchParams.get("end"));
  if (!range.success) return apiError("Invalid date range.", 400, { fields: range.error.flatten().fieldErrors });

  const payments = await listPayments(range.start, range.end);

  const rows = ["id,bookingId,amount,method,status,transactionReference,processedAt,notes,createdAt"];
  for (const p of payments) {
    rows.push([p.id, p.bookingId ?? "", p.amount.toFixed(2), p.method, p.status, p.transactionReference ?? "", p.processedAt ?? "", (p.notes ?? "").replace(/\n/g, " "), p.createdAt].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",") );
  }

  const csv = rows.join("\n");
  return new NextResponse(csv, { status: 200, headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=payments.csv" } });
}
