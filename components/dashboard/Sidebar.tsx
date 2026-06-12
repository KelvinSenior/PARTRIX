"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { primaryNavItems, isNavActive } from "@/lib/navConfig";
import { appCard } from "@/lib/appStyles";
import PartrixLogo from "@/components/brand/PartrixLogo";

export default function Sidebar() {
  const pathname = usePathname() || "/";

  return (
    <aside className={`hidden shrink-0 flex-col lg:flex ${appCard} lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)]`}>
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/75">Partrix</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Operations</h2>
        </div>
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex"
        >
          <PartrixLogo size={44} showWordmark={false} />
        </motion.div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5" aria-label="Sidebar">
        {primaryNavItems.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition touch-target ${
                active
                  ? "bg-cyan-400/15 text-cyan-100"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-cyan-300" : "text-zinc-500"}`} aria-hidden />
              <span className="flex-1">{item.label}</span>
              {active ? <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-cyan-200/10 bg-slate-950/50 p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Live alerts</p>
        <div className="mt-3 space-y-2 text-sm text-zinc-300">
          <p>• Confirm pending bookings</p>
          <p>• Review low stock items</p>
          <p>• Track today&apos;s deliveries</p>
        </div>
      </div>
    </aside>
  );
}
