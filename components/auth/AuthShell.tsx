"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import PartrixLogo from "@/components/brand/PartrixLogo";

type AuthShellProps = {
  title: string;
  subtitle: string;
  cardTitle: string;
  cardSubtitle: string;
  footer: ReactNode;
  children: ReactNode;
};

export default function AuthShell({ title, subtitle, cardTitle, cardSubtitle, footer, children }: AuthShellProps) {
  return (
    <main className="relative -mx-4 min-h-[100dvh] overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_48%,#eef2ff_100%)] px-4 pb-8 pt-6 text-slate-900 md:-mx-6 md:px-6 md:pt-10 lg:-mx-8 lg:px-8 dark:bg-[#0B1020] dark:text-zinc-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(8,145,178,0.14),transparent_45%),linear-gradient(135deg,#ffffff_0%,#f8fafc_48%,#eef2ff_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_45%),linear-gradient(135deg,#050816_0%,#0B1020_48%,#050816_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:28px_28px] opacity-25" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
        <section className="hidden h-full rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-sm backdrop-blur-2xl lg:block dark:border-cyan-200/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-200/75">Operational intelligence</p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">Run rental operations with confidence</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-zinc-300">
            Inventory, bookings, logistics, and finance visibility in one enterprise-ready command center.
          </p>
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-cyan-200/15 dark:bg-slate-950/40">
              <p className="text-xs text-slate-500 dark:text-zinc-400">Today revenue</p>
              <p className="mt-2 text-2xl font-semibold text-cyan-700 dark:text-cyan-200">GHC18,420</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-zinc-700/70 dark:bg-slate-950/45">
                <p className="text-xs text-slate-500 dark:text-zinc-400">Active bookings</p>
                <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">124</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-zinc-700/70 dark:bg-slate-950/45">
                <p className="text-xs text-slate-500 dark:text-zinc-400">Inventory health</p>
                <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">96%</p>
              </div>
            </div>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mx-auto w-full max-w-lg space-y-6"
        >
          <header className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-300 bg-white/80 px-4 py-2 backdrop-blur dark:border-cyan-200/20 dark:bg-white/5">
              <PartrixLogo size={32} />
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl dark:text-white">{title}</h1>
            <p className="text-sm text-slate-600 md:text-base dark:text-zinc-300">{subtitle}</p>
          </header>

          <article className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_24px_48px_rgba(15,23,42,0.12)] backdrop-blur-2xl md:p-7 dark:border-cyan-200/15 dark:bg-white/10 dark:shadow-[0_24px_48px_rgba(2,6,23,0.5)]">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{cardTitle}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-300">{cardSubtitle}</p>
            <div className="mt-6">{children}</div>
          </article>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-center text-sm text-slate-600 dark:border-cyan-200/10 dark:bg-white/[0.04] dark:text-zinc-300">{footer}</div>
        </motion.section>
      </div>
    </main>
  );
}
