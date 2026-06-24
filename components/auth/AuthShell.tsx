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
    <main className="relative -mx-4 min-h-[100dvh] overflow-hidden bg-[#0B1020] px-4 pb-8 pt-6 text-zinc-100 md:-mx-6 md:px-6 md:pt-10 lg:-mx-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_45%),linear-gradient(135deg,#050816_0%,#0B1020_48%,#050816_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:28px_28px] opacity-25" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
        <section className="hidden h-full rounded-3xl border border-cyan-200/10 bg-white/5 p-8 backdrop-blur-2xl lg:block">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/75">Operational intelligence</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">Run rental operations with confidence</h2>
          <p className="mt-3 text-sm text-zinc-300">
            Inventory, bookings, logistics, and finance visibility in one enterprise-ready command center.
          </p>
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-cyan-200/15 bg-slate-950/40 p-4">
              <p className="text-xs text-zinc-400">Today revenue</p>
              <p className="mt-2 text-2xl font-semibold text-cyan-200">GHC18,420</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-zinc-700/70 bg-slate-950/45 p-4">
                <p className="text-xs text-zinc-400">Active bookings</p>
                <p className="mt-2 text-xl font-semibold">124</p>
              </div>
              <div className="rounded-2xl border border-zinc-700/70 bg-slate-950/45 p-4">
                <p className="text-xs text-zinc-400">Inventory health</p>
                <p className="mt-2 text-xl font-semibold">96%</p>
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
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/20 bg-white/5 px-4 py-2 backdrop-blur">
              <PartrixLogo size={32} />
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">{title}</h1>
            <p className="text-sm text-zinc-300 md:text-base">{subtitle}</p>
          </header>

          <article className="rounded-3xl border border-cyan-200/15 bg-white/10 p-5 shadow-[0_24px_48px_rgba(2,6,23,0.5)] backdrop-blur-2xl md:p-7">
            <h2 className="text-2xl font-semibold text-white">{cardTitle}</h2>
            <p className="mt-2 text-sm text-zinc-300">{cardSubtitle}</p>
            <div className="mt-6">{children}</div>
          </article>

          <div className="rounded-2xl border border-cyan-200/10 bg-white/[0.04] p-4 text-center text-sm text-zinc-300">{footer}</div>
        </motion.section>
      </div>
    </main>
  );
}
