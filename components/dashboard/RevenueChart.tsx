"use client";

import { motion } from "framer-motion";
import type { FinanceSummary } from "@/types/finance";
import { appCard, appCardInner, appEyebrow } from "@/lib/appStyles";

export default function RevenueChart({ financeSummary }: { financeSummary?: FinanceSummary }) {
  // Get last 6 months of data
  const monthlyData = financeSummary?.monthly.slice(-6) ?? [];
  const hasData = monthlyData.length > 0;
  
  const totalRevenue = hasData ? monthlyData.reduce((sum, m) => sum + m.revenue, 0) : 0;
  const prevRevenue = hasData && monthlyData.length > 1 ? monthlyData[monthlyData.length - 2].revenue : 0;
  const currentRevenue = hasData ? monthlyData[monthlyData.length - 1]?.revenue ?? 0 : 0;
  const changePercent = prevRevenue > 0 ? (((currentRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1) : 0;
  const isPositive = Number(changePercent) >= 0;

  // Generate SVG path from data
  let points = "";
  if (hasData) {
    const maxValue = Math.max(...monthlyData.map(m => m.revenue), 1);
    const width = 320;
    const height = 80;
    const pointWidth = width / (monthlyData.length - 1 || 1);

    points = monthlyData
      .map((m, i) => {
        const x = i * pointWidth;
        const y = height - (m.revenue / maxValue) * height;
        return `${x},${y}`;
      })
      .join(" ");
  } else {
    points = "0,80 40,65 80,50 120,45 160,30 200,40 240,25 280,30 320,20";
  }
  return (
    <div className={appCard}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={appEyebrow}>Revenue</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">${(totalRevenue / 1000).toFixed(1)}k</h2>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${isPositive ? "bg-emerald-400/15 text-emerald-200" : "bg-rose-400/15 text-rose-200"}`}>
          {isPositive ? "+" : ""}{changePercent}% vs last month
        </span>
      </div>

      <div className={`mt-6 overflow-hidden ${appCardInner}`}>
        <svg viewBox="0 0 340 110" className="h-48 w-full overflow-visible">
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path
            d={`M${points}`}
            fill="none"
            stroke="url(#revenueGradient)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <motion.path
            d={`M${points} L320,110 0,110 Z`}
            fill="url(#revenueGradient)"
            opacity="0.15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </svg>
      </div>
    </div>
  );
}
