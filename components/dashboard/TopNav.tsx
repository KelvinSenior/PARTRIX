"use client";

import Link from "next/link";
import { SessionUser } from "@/types/auth";
import { useState } from "react";
import { Menu, Plus } from "lucide-react";
import MobileSidebar from "./MobileSidebar";
import { appCard, appBtnPrimary, appBtnSecondary } from "@/lib/appStyles";

export default function TopNav({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);

  const greeting = user?.name?.split(" ")[0] ?? user?.email ?? "Operator";

  return (
    <header className={`sticky top-0 z-40 ${appCard}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Welcome back</p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-semibold text-white sm:text-2xl">
              {user ? `Hi, ${greeting}` : "RENTFLOW"}
            </h1>
            {user ? (
              <span className="inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                {user.role}
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-200/15 bg-white/5 text-zinc-200 transition hover:bg-white/10 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/profile" className={appBtnSecondary}>
          Profile
        </Link>
        <Link href="/bookings" className={appBtnPrimary}>
          <Plus className="h-4 w-4" aria-hidden />
          New booking
        </Link>
      </div>

      <MobileSidebar open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
