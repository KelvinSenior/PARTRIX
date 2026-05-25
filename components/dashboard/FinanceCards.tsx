import StatsCard from "@/components/dashboard/StatsCard";

export default function FinanceCards({ totals }: { totals: { revenue: number; expenses: number; profit: number; outstanding: number } }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard icon="💰" label="Revenue" value={`$${totals.revenue.toLocaleString()}`} change="+0%" highlight />
      <StatsCard icon="🧾" label="Expenses" value={`$${totals.expenses.toLocaleString()}`} change="-0%" />
      <StatsCard icon="📈" label="Profit" value={`$${totals.profit.toLocaleString()}`} change="+0%" />
      <StatsCard icon="📨" label="Outstanding" value={`$${totals.outstanding.toLocaleString()}`} change="-2%" />
    </div>
  );
}
