import StatsCard from "@/components/dashboard/StatsCard";
import { formatAmount } from "@/lib/branding";
import type { SettingsDTO } from "@/types/settings";

export default function FinanceCards({ totals, settings }: { totals: { revenue: number; expenses: number; profit: number; outstanding: number }; settings: SettingsDTO }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard icon="dollarSign" label="Revenue" value={formatAmount(totals.revenue, settings)} change="+0%" highlight />
      <StatsCard icon="receipt" label="Expenses" value={formatAmount(totals.expenses, settings)} change="-0%" />
      <StatsCard icon="trendingUp" label="Profit" value={formatAmount(totals.profit, settings)} change="+0%" />
      <StatsCard icon="alertCircle" label="Outstanding" value={formatAmount(totals.outstanding, settings)} change="-2%" />
    </div>
  );
}
