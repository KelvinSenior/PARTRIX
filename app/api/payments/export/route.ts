import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { listPayments } from "@/services/finance";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const url = new URL(request.url);
  const start = url.searchParams.get("start") ? new Date(url.searchParams.get("start") as string) : undefined;
  const end = url.searchParams.get("end") ? new Date(url.searchParams.get("end") as string) : undefined;

  const payments = await listPayments(start, end);

  const rows = ["id,bookingId,amount,method,status,transactionReference,processedAt,notes,createdAt"];
  for (const p of payments) {
    rows.push([p.id, p.bookingId ?? "", p.amount.toFixed(2), p.method, p.status, p.transactionReference ?? "", p.processedAt ?? "", (p.notes ?? "").replace(/\n/g, " "), p.createdAt].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",") );
  }

  const csv = rows.join("\n");
  return new NextResponse(csv, { status: 200, headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=payments.csv" } });
}
