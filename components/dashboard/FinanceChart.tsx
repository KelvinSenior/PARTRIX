"use client";

import { motion } from "framer-motion";
import { appCard, appCardInner, appEyebrow } from "@/lib/appStyles";

export default function FinanceChart({ monthly }: { monthly: Array<{ month: string; revenue: number; expenses: number; profit: number }> }) {
  // Simple SVG sparkline using revenue over months
  const points = monthly.map((m, i) => `${i * 40},${80 - Math.min(70, Math.round(m.revenue / 1000))}`).join(" ");

  return (
    <div className={appCard}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={appEyebrow}>Finance (monthly)</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Monthly overview</h2>
        </div>
      </div>

      <div className={`mt-5 overflow-hidden ${appCardInner}`}>
        <svg viewBox="0 0 340 100" className="h-36 w-full overflow-visible">
          <path d={`M${points}`} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
          <motion.path d={`M${points} L320,100 0,100 Z`} fill="#10b981" opacity={0.12} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
        </svg>
      </div>
    </div>
  );
}
