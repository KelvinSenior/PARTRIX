import StatsCard from "@/components/dashboard/StatsCard";

export default function FinanceCards({ totals }: { totals: { revenue: number; expenses: number; profit: number; outstanding: number } }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard icon="dollarSign" label="Revenue" value={`GHC${totals.revenue.toLocaleString()}`} change="+0%" highlight />
      <StatsCard icon="receipt" label="Expenses" value={`GHC${totals.expenses.toLocaleString()}`} change="-0%" />
      <StatsCard icon="trendingUp" label="Profit" value={`GHC${totals.profit.toLocaleString()}`} change="+0%" />
      <StatsCard icon="alertCircle" label="Outstanding" value={`GHC${totals.outstanding.toLocaleString()}`} change="-2%" />
    </div>
  );
}
