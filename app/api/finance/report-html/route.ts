import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { hasPermission } from "@/lib/rolePolicy";
import { getFinanceSummary } from "@/services/finance";
import { getOrganizationSettings } from "@/services/settings";
import { formatAmount } from "@/lib/branding";
import { parseFinanceDateRange } from "@/lib/financeValidation";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);
  if (!hasPermission(user.role, "finance:read")) return apiError("You do not have permission to view financial reports.", 403);

  const url = new URL(request.url);
  const range = parseFinanceDateRange(url.searchParams.get("start"), url.searchParams.get("end"));
  if (!range.success) return apiError("Invalid date range.", 400, { fields: range.error.flatten().fieldErrors });
  const { start, end } = range;

  const summary = await getFinanceSummary(start, end);
  const settings = await getOrganizationSettings();

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Finance Report</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border:1px solid #ddd}</style></head><body><h1>Finance Report</h1><p>Period: ${start ? start.toISOString().slice(0,10) : 'All'} - ${end ? end.toISOString().slice(0,10) : 'All'}</p><h2>Totals</h2><ul><li>Revenue: ${formatAmount(summary.totals.revenue, settings)}</li><li>Expenses: ${formatAmount(summary.totals.expenses, settings)}</li><li>Profit: ${formatAmount(summary.totals.profit, settings)}</li><li>Outstanding: ${formatAmount(summary.totals.outstanding, settings)}</li></ul></body></html>`;

  return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html" } });
}
