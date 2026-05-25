"use client";

import { motion } from "framer-motion";

interface StatsCardProps {
  label: string;
  value: string;
  change: string;
  icon: string;
  highlight?: boolean;
}

export default function StatsCard({ label, value, change, icon, highlight }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm shadow-zinc-200/30 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-zinc-950/15 ${
        highlight ? "ring-1 ring-sky-400/20" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-zinc-100 text-2xl dark:bg-zinc-900">{icon}</span>
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">{label}</span>
      </div>
      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50">{value}</p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Compared to last week</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{change}</span>
      </div>
    </motion.div>
  );
}
