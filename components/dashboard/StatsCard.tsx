"use client";

import { motion } from "framer-motion";
import { AlertCircle, Briefcase, DollarSign, Package, Receipt, Truck, TrendingUp, Wallet } from "lucide-react";
import { appCard, appEyebrow } from "@/lib/appStyles";

interface StatsCardProps {
  label: string;
  value: string;
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

export default function StatsCard({ label, value, icon, highlight }: StatsCardProps) {
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
      <div className="mt-6">
        <p className="text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
      </div>
    </motion.div>
  );
}
