"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SessionUser } from "@/types/auth";
import { useState } from "react";
import MobileSidebar from "./MobileSidebar";

export default function TopNav({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 rounded-[32px] border border-zinc-200/80 bg-white/90 p-5 shadow-sm shadow-zinc-200/30 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/90 dark:shadow-zinc-950/20 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Welcome back</p>
          <div className="flex flex-wrap items-center gap-3">
            {user ? (
              <>
                <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Good afternoon, {user.name ?? user.email}</h1>
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{user.role}</span>
              </>
            ) : (
              <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Damage Report</h1>
            )}
          </div>
        </div>

        <button onClick={() => setOpen(true)} className="-mr-2 inline-flex items-center gap-2 rounded-md p-2 text-zinc-700 hover:bg-zinc-100 lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          <span className="sr-only">Open menu</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/profile" className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 touch-target">
          View profile
        </Link>
        <motion.button
          whileHover={{ y: -2 }}
          className="rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition touch-target"
        >
          Create booking
        </motion.button>
      </div>

      <MobileSidebar open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
