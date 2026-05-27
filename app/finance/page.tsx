import { redirect } from "next/navigation";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import FinanceCards from "@/components/dashboard/FinanceCards";
import FinanceChart from "@/components/dashboard/FinanceChartClient";
import DateFilter from "@/components/dashboard/DateFilter";
import PaymentForm from "@/components/dashboard/PaymentForm";
import ExpenseForm from "@/components/dashboard/ExpenseForm";
import { getFinanceSummary, listPayments, listExpenses, getCustomerDebts } from "@/services/finance";
import { appBtnSecondary, appCard, appCardInner } from "@/lib/appStyles";

export default async function FinancePage({ searchParams }: { searchParams?: { start?: string; end?: string } }) {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");
  if (!user) redirect("/login");

  const start = searchParams?.start ? new Date(searchParams.start) : undefined;
  const end = searchParams?.end ? new Date(searchParams.end) : undefined;

  const summary = await getFinanceSummary(start, end);
  const payments = await listPayments(start, end);
  const expenses = await listExpenses(start, end);
  const debts = await getCustomerDebts();

  const query = searchParams?.start || searchParams?.end
    ? `?${new URLSearchParams({ start: searchParams?.start ?? "", end: searchParams?.end ?? "" }).toString()}`
    : "";

  return (
    <AppShell user={user} showFab={false}>
      <PageHeader
        eyebrow="Finance"
        title="Revenue & expenses"
        description="Track payments, expenses, profit, and outstanding balances."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DateFilter start={searchParams?.start} end={searchParams?.end} />
            <a href={`/api/payments/export${query}`} className={appBtnSecondary}>
              Export payments
            </a>
            <a href={`/api/expenses/export${query}`} className={appBtnSecondary}>
              Export expenses
            </a>
            <a href={`/api/finance/report-pdf${query}`} className={appBtnSecondary}>
              PDF report
            </a>
          </div>
        }
      />

      <FinanceCards totals={summary.totals} />

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <FinanceChart monthly={summary.monthly} />

          <div className={appCard}>
            <h3 className="text-lg font-semibold text-white">Record payment</h3>
            <div className="mt-4">
              <PaymentForm />
            </div>
          </div>

          <div className={appCard}>
            <h3 className="text-lg font-semibold text-white">Record expense</h3>
            <div className="mt-4">
              <ExpenseForm />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className={appCard}>
            <h3 className="text-lg font-semibold text-white">Recent payments</h3>
            <div className="mt-4 space-y-3 text-sm">
              {payments.slice(0, 8).map((p: { id: string; amount: number; method: string; processedAt?: string | null; createdAt: string | Date; bookingId?: string | null }) => (
                <div key={p.id} className={`${appCardInner} flex items-center justify-between gap-3`}>
                  <div>
                    <div className="font-medium text-white">${p.amount.toFixed(2)}</div>
                    <div className="text-xs text-zinc-500">
                      {p.method} • {p.processedAt ?? new Date(p.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400">
                    {p.bookingId ? `Booking ${p.bookingId.slice(0, 8)}` : "Unlinked"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={appCard}>
            <h3 className="text-lg font-semibold text-white">Recent expenses</h3>
            <div className="mt-4 space-y-3 text-sm">
              {expenses.slice(0, 8).map((e: { id: string; amount: number; category: string; incurredAt: string | Date; vendor?: string | null }) => (
                <div key={e.id} className={`${appCardInner} flex items-center justify-between gap-3`}>
                  <div>
                    <div className="font-medium text-white">${e.amount.toFixed(2)}</div>
                    <div className="text-xs text-zinc-500">
                      {e.category} • {new Date(e.incurredAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400">{e.vendor ?? "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={appCard}>
        <h3 className="text-lg font-semibold text-white">Customer debts</h3>
        <div className="mt-4 text-sm text-zinc-300">
          {debts.length === 0 ? (
            <p className="text-zinc-500">No outstanding customer debts.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-zinc-500">
                    <th className="pb-2 pr-4">Customer</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2">Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.map((d: { customerId: string; customerName: string; email?: string | null; outstanding: number }) => (
                    <tr key={d.customerId} className="border-b border-white/5">
                      <td className="py-2.5 pr-4 text-white">{d.customerName}</td>
                      <td className="py-2.5 pr-4 text-zinc-400">{d.email ?? "—"}</td>
                      <td className="py-2.5 font-medium text-cyan-100">${d.outstanding.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
