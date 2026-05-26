import { redirect } from "next/navigation";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import FinanceCards from "@/components/dashboard/FinanceCards";
import FinanceChart from "@/components/dashboard/FinanceChartClient";
import DateFilter from "@/components/dashboard/DateFilter";
import PaymentForm from "@/components/dashboard/PaymentForm";
import ExpenseForm from "@/components/dashboard/ExpenseForm";
import { getFinanceSummary, listPayments, listExpenses, getCustomerDebts } from "@/services/finance";

export default async function FinancePage({ searchParams }: { searchParams?: { start?: string; end?: string } }) {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");
  if (!user) redirect("/login");

  const start = searchParams?.start ? new Date(searchParams.start) : undefined;
  const end = searchParams?.end ? new Date(searchParams.end) : undefined;

  const summary = await getFinanceSummary(start, end);
  const payments = await listPayments(start, end);
  const expenses = await listExpenses(start, end);
  const debts = await getCustomerDebts();

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-[1800px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <Sidebar />

        <section className="space-y-6">
          <TopNav user={user} />

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold">Finance</h1>
              <div className="flex items-center gap-3">
                <DateFilter start={searchParams?.start} end={searchParams?.end} />
                <a href={`/api/payments/export${searchParams?.start || searchParams?.end ? `?${new URLSearchParams({ start: searchParams?.start ?? '', end: searchParams?.end ?? '' }).toString()}` : ''}`} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800">Export Payments CSV</a>
                <a href={`/api/expenses/export${searchParams?.start || searchParams?.end ? `?${new URLSearchParams({ start: searchParams?.start ?? '', end: searchParams?.end ?? '' }).toString()}` : ''}`} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800">Export Expenses CSV</a>
                <a href={`/api/finance/report-pdf${searchParams?.start || searchParams?.end ? `?${new URLSearchParams({ start: searchParams?.start ?? '', end: searchParams?.end ?? '' }).toString()}` : ''}`} className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700">Download PDF</a>
              </div>
            </div>

            <FinanceCards totals={summary.totals} />

            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-6">
                <FinanceChart monthly={summary.monthly} />

                <div className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/85">
                  <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Record Payment</h3>
                  <div className="mt-4">
                    <PaymentForm />
                  </div>
                </div>

                <div className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/85">
                  <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Record Expense</h3>
                  <div className="mt-4">
                    <ExpenseForm />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/85">
                  <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Recent Payments</h3>
                  <div className="mt-4 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {payments.slice(0, 8).map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-zinc-950 dark:text-zinc-50">${p.amount.toFixed(2)}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">{p.method} • {p.processedAt ?? new Date(p.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">{p.bookingId ? `Booking ${p.bookingId.slice(0, 8)}` : "Unlinked"}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/85">
                  <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Recent Expenses</h3>
                  <div className="mt-4 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {expenses.slice(0, 8).map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-zinc-950 dark:text-zinc-50">${e.amount.toFixed(2)}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">{e.category} • {new Date(e.incurredAt).toLocaleDateString()}</div>
                        </div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">{e.vendor ?? "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/85">
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Customer Debts</h3>
              <div className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
                {debts.length === 0 ? (
                  <div>No outstanding customer debts.</div>
                ) : (
                  <table className="w-full table-auto text-left text-sm">
                    <thead>
                      <tr className="text-zinc-600 dark:text-zinc-400">
                        <th className="pb-2">Customer</th>
                        <th className="pb-2">Email</th>
                        <th className="pb-2">Outstanding</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debts.map((d: any) => (
                        <tr key={d.customerId} className="border-t border-zinc-200 dark:border-zinc-700">
                          <td className="py-2 text-zinc-950 dark:text-zinc-50">{d.customerName}</td>
                          <td className="py-2 text-zinc-500 dark:text-zinc-400">{d.email ?? "—"}</td>
                          <td className="py-2 text-zinc-950 dark:text-zinc-50">${d.outstanding.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
