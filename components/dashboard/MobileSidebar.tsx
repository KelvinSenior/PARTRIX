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
        <div className="fixed inset-0 z-[70] lg:hidden">
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
            className="absolute right-0 top-0 flex h-full w-[min(100%,340px)] flex-col border-l border-white/10 bg-[#060b1a]/95 p-5 shadow-[0_20px_80px_rgba(2,8,23,0.85)] z-[80]"
          >
            <div className="mb-6 rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.32em] text-cyan-200/75">Partrix</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">Navigation</h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/15 bg-white/10 text-zinc-200 transition hover:bg-white/15"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
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
                        ? "border-cyan-400/20 bg-cyan-400/15 text-cyan-100"
                        : "border-transparent text-zinc-300 hover:border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
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
