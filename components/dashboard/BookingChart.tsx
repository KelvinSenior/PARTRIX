"use client";

import { motion } from "framer-motion";

const bars = [
  { label: "Mon", value: 42 },
  { label: "Tue", value: 68 },
  { label: "Wed", value: 55 },
  { label: "Thu", value: 80 },
  { label: "Fri", value: 62 },
  { label: "Sat", value: 74 },
  { label: "Sun", value: 58 },
];

export default function BookingChart() {
  return (
    <div className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm shadow-zinc-200/30 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-zinc-950/15">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Bookings</p>
          <h2 className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">483 this week</h2>
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-2 text-sm font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">Stable +4.3%</span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-7">
        {bars.map((bar) => (
          <div key={bar.label} className="flex flex-col items-center gap-3">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${bar.value}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex h-32 w-full max-w-[40px] items-end rounded-3xl bg-gradient-to-t from-sky-500 to-sky-300"
              style={{ height: `${bar.value}%` }}
            >
              <span className="sr-only">{bar.value}%</span>
            </motion.div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
