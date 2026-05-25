import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { listExpenses } from "@/services/finance";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const url = new URL(request.url);
  const start = url.searchParams.get("start") ? new Date(url.searchParams.get("start") as string) : undefined;
  const end = url.searchParams.get("end") ? new Date(url.searchParams.get("end") as string) : undefined;

  const expenses = await listExpenses(start, end);

  const rows = ["id,bookingId,category,amount,vendor,incurredAt,notes,createdAt"];
  for (const e of expenses) {
    rows.push([e.id, e.bookingId ?? "", e.category, e.amount.toFixed(2), e.vendor ?? "", e.incurredAt, (e.notes ?? "").replace(/\n/g, " "), e.createdAt].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",") );
  }

  const csv = rows.join("\n");
  return new NextResponse(csv, { status: 200, headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=expenses.csv" } });
}
