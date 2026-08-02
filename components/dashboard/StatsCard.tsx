"use client";

import { motion } from "framer-motion";
import { AlertCircle, Briefcase, DollarSign, Package, Receipt, Truck, TrendingUp, Wallet } from "lucide-react";
import { appCard, appEyebrow } from "@/lib/appStyles";

interface StatsCardProps {
  label: string;
  value: string;
  change: string;
  icon: "briefcase" | "package" | "truck" | "wallet" | "dollarSign" | "receipt" | "trendingUp" | "alertCircle";
  highlight?: boolean;
}

const iconMap = {
  briefcase: Briefcase,
  package: Package,
  truck: Truck,
  wallet: Wallet,
  dollarSign: DollarSign,
  receipt: Receipt,
  trendingUp: TrendingUp,
  alertCircle: AlertCircle,
};

export default function StatsCard({ label, value, change, icon, highlight }: StatsCardProps) {
  const isPositive = change.startsWith("+");
  const Icon = iconMap[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${appCard} h-full ${highlight ? "ring-1 ring-cyan-400/25" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200/80 bg-cyan-100 text-cyan-700 shadow-sm dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <p className={appEyebrow}>{label}</p>
      </div>
      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">vs last week</p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
            isPositive
              ? "border-emerald-300/70 bg-emerald-100 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/15 dark:text-emerald-200"
              : "border-rose-300/70 bg-rose-100 text-rose-700 dark:border-rose-400/25 dark:bg-rose-400/15 dark:text-rose-200"
          }`}
        >
          {change}
        </span>
      </div>
    </motion.div>
  );
}
