import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { getFinanceSummary } from "@/services/finance";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  // Build report HTML (reuse summary generator)
  const url = new URL(request.url);
  const start = url.searchParams.get("start") ? new Date(url.searchParams.get("start") as string) : undefined;
  const end = url.searchParams.get("end") ? new Date(url.searchParams.get("end") as string) : undefined;

  const summary = await getFinanceSummary(start, end);

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Finance Report</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border:1px solid #ddd}</style></head><body><h1>Finance Report</h1><p>Period: ${start ? start.toISOString().slice(0,10) : 'All'} - ${end ? end.toISOString().slice(0,10) : 'All'}</p><h2>Totals</h2><ul><li>Revenue: GHC${summary.totals.revenue.toFixed(2)}</li><li>Expenses: GHC${summary.totals.expenses.toFixed(2)}</li><li>Profit: GHC${summary.totals.profit.toFixed(2)}</li><li>Outstanding: GHC${summary.totals.outstanding.toFixed(2)}</li></ul></body></html>`;

  // Try to use puppeteer if available to render PDF, otherwise return HTML with guidance
  try {
    // dynamic runtime require so we don't hard-depend on puppeteer at compile time
    let puppeteer: any;
    try {
      // Use runtime require via eval to avoid static module resolution at compile time
      const runtimeRequire: any = eval("require");
      puppeteer = runtimeRequire('puppeteer');
    } catch {
      puppeteer = null;
    }

    if (puppeteer) {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();

      return new NextResponse(pdfBuffer, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename=finance-report.pdf' } });
    }

    // If puppeteer isn't installed or fails, return HTML and a note
    const message = `PDF generation not available on this server. Install 'puppeteer' to enable PDF export.`;
    const payload = `<html><body><h2>PDF generation unavailable</h2><p>${message}</p><hr/>${html}</body></html>`;
    return new NextResponse(payload, { status: 501, headers: { 'Content-Type': 'text/html' } });
  } catch (err) {
    // If puppeteer isn't installed or fails, return HTML and a note
    const message = `PDF generation not available on this server. Install 'puppeteer' to enable PDF export.\n\n${(err as Error).message ?? ''}`;
    const payload = `<html><body><h2>PDF generation unavailable</h2><p>${message}</p><hr/>${html}</body></html>`;
    return new NextResponse(payload, { status: 501, headers: { 'Content-Type': 'text/html' } });
  }
}
