import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { getFinanceSummary } from "@/services/finance";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const url = new URL(request.url);
  const start = url.searchParams.get("start") ? new Date(url.searchParams.get("start") as string) : undefined;
  const end = url.searchParams.get("end") ? new Date(url.searchParams.get("end") as string) : undefined;

  const summary = await getFinanceSummary(start, end);

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Finance Report</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border:1px solid #ddd}</style></head><body><h1>Finance Report</h1><p>Period: ${start ? start.toISOString().slice(0,10) : 'All'} - ${end ? end.toISOString().slice(0,10) : 'All'}</p><h2>Totals</h2><ul><li>Revenue: GHC${summary.totals.revenue.toFixed(2)}</li><li>Expenses: GHC${summary.totals.expenses.toFixed(2)}</li><li>Profit: GHC${summary.totals.profit.toFixed(2)}</li><li>Outstanding: GHC${summary.totals.outstanding.toFixed(2)}</li></ul></body></html>`;

  return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html" } });
}
