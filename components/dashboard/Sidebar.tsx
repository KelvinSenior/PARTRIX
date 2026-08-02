"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { primaryNavItems, isNavActive } from "@/lib/navConfig";
import PartrixLogo from "@/components/brand/PartrixLogo";

export default function Sidebar() {
  const pathname = usePathname() || "/";

  return (
    <aside className="hidden w-full shrink-0 flex-col overflow-hidden rounded-[30px] border border-slate-300/90 bg-slate-50/95 p-3 shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_24px_70px_rgba(15,23,42,0.14)] lg:flex lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)] lg:min-h-0 dark:border-cyan-200/10 dark:bg-[#060b1a]/95">
      <div className="flex h-full flex-1 flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 p-4 shadow-sm dark:border-cyan-200/10 dark:bg-[#070d1f]/90">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-200/75">Partrix</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Operations</h2>
          </div>
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex"
          >
            <PartrixLogo size={44} showWordmark={false} />
          </motion.div>
        </div>

        <nav className="mt-1 flex flex-1 flex-col gap-1.5 overflow-y-auto rounded-2xl border border-slate-200/80 bg-slate-50/90 p-2 shadow-inner dark:border-white/10 dark:bg-white/[0.04]" aria-label="Sidebar">
          {primaryNavItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm font-medium transition touch-target ${
                  active
                    ? "border-cyan-300/80 bg-cyan-50 text-cyan-800 shadow-sm dark:border-cyan-400/20 dark:bg-cyan-400/15 dark:text-cyan-100"
                    : "border-transparent text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:border-white/10 dark:hover:bg-white/5 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-cyan-700 dark:text-cyan-300" : "text-slate-600 dark:text-zinc-500"}`} aria-hidden />
                <span className="flex-1">{item.label}</span>
                {active ? <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-300" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-100/90 p-4 shadow-sm dark:border-cyan-200/10 dark:bg-slate-950/50">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-600 dark:text-zinc-500">Live alerts</p>
          <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-zinc-300">
            <p>• Confirm pending bookings</p>
            <p>• Review low stock items</p>
            <p>• Track today&apos;s deliveries</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
