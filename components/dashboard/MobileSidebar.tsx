"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { primaryNavItems, isNavActive } from "@/lib/navConfig";

export default function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname() || "/";

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-120 lg:hidden">
          <motion.button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 z-130 flex h-screen w-[min(100%,288px)] max-w-[88vw] flex-col overflow-hidden border-l border-slate-300/80 bg-white/98 p-4 shadow-[0_24px_90px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-[#060b1a]/95 dark:shadow-[0_20px_80px_rgba(2,8,23,0.85)] sm:w-[min(100%,320px)]"
          >
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-cyan-400/15 dark:bg-cyan-400/10 dark:shadow-none">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.32em] text-cyan-700 dark:text-cyan-200/75">Partrix</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Navigation</h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-cyan-200/15 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <nav className="flex flex-col gap-1 overflow-y-auto pb-4">
              {primaryNavItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "border-cyan-300/80 bg-cyan-50 text-cyan-800 shadow-sm dark:border-cyan-400/20 dark:bg-cyan-400/15 dark:text-cyan-100"
                        : "border-transparent text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:text-zinc-300 dark:hover:border-white/10 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-cyan-700 dark:text-cyan-300" : "text-slate-600 dark:text-zinc-400"}`} aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
