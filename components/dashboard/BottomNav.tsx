"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileBottomNavItems, isNavActive } from "@/lib/navConfig";

export default function BottomNav() {
  const pathname = usePathname() || "/";

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <div className="mx-auto max-w-lg px-3 pb-2 pt-1">
        <div className="flex items-stretch justify-between gap-1 rounded-2xl border border-cyan-200/15 bg-[#0c1528]/95 p-1.5 shadow-[0_-8px_32px_rgba(2,6,23,0.6)] backdrop-blur-xl">
          {mobileBottomNavItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`touch-target flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center transition ${
                  active
                    ? "bg-cyan-400/15 text-cyan-200"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
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
