"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const actions = [
  { label: "New booking", description: "Create a new event booking", tone: "from-sky-500 to-violet-500", href: "/bookings" },
  { label: "Add inventory", description: "Update stock counts quickly", tone: "from-emerald-500 to-teal-500", href: "/inventory" },
  { label: "Send invoice", description: "Generate and send invoices", tone: "from-amber-500 to-orange-500", href: "/dashboard#reports" },
];

export default function QuickActions() {
  return (
    <div className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm shadow-zinc-200/30 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-zinc-950/15">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Quick actions</p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Get moving fast</h2>
        </div>
        <button className="rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
          Explore actions
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {actions.map((action) => (
          <motion.div
            key={action.label}
            whileHover={{ y: -2 }}
            className={`rounded-3xl bg-gradient-to-br ${action.tone} px-5 py-4 text-left text-white shadow-lg shadow-slate-900/10 transition`}
          >
            <Link href={action.href} className="block">
              <span className="block text-sm font-semibold">{action.label}</span>
              <span className="mt-2 block text-xs opacity-90">{action.description}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
