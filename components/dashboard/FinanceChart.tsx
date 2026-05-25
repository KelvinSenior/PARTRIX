"use client";

import { motion } from "framer-motion";

export default function FinanceChart({ monthly }: { monthly: Array<{ month: string; revenue: number; expenses: number; profit: number }> }) {
  // Simple SVG sparkline using revenue over months
  const points = monthly.map((m, i) => `${i * 40},${80 - Math.min(70, Math.round(m.revenue / 1000))}`).join(" ");

  return (
    <div className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm shadow-zinc-200/30 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-zinc-950/15">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Finance (monthly)</p>
          <h2 className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">Monthly Overview</h2>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] border border-zinc-200/70 bg-zinc-50 p-4 dark:border-zinc-800/70 dark:bg-zinc-900/90">
        <svg viewBox="0 0 340 100" className="h-36 w-full overflow-visible">
          <path d={`M${points}`} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
          <motion.path d={`M${points} L320,100 0,100 Z`} fill="#10b981" opacity={0.12} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
        </svg>
      </div>
    </div>
  );
}
