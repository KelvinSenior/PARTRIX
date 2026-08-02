"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileBottomNavItems, isNavActive } from "@/lib/navConfig";

export default function BottomNav() {
  const pathname = usePathname() || "/";

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <div className="mx-auto max-w-lg px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        <div className="flex items-stretch justify-between gap-1 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-[0_-8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-cyan-200/15 dark:bg-[#0c1528]/95 dark:shadow-[0_-8px_32px_rgba(2,6,23,0.6)]">
          {mobileBottomNavItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`touch-target flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center transition ${
                  active
                    ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-200"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-cyan-300" : ""}`} aria-hidden />
                <span className="text-[10px] font-medium leading-none sm:text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
