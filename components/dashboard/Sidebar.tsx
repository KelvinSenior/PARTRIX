"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Bookings", href: "/bookings" },
  { label: "Deliveries", href: "/deliveries" },
  { label: "Inventory", href: "/inventory" },
  { label: "Customers", href: "/customers" },
  { label: "Finance", href: "/finance" },
  { label: "Reports", href: "/dashboard#reports" },
  { label: "Settings", href: "/dashboard#settings" },
];

export default function Sidebar() {
  const pathname = usePathname() || "/";

  return (
    <aside className="hidden md:flex md:w-20 lg:w-[320px] shrink-0 flex-col rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-lg shadow-zinc-200/40 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/95 dark:shadow-zinc-950/20">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">RENTFLOW</p>
          <h2 className="mt-3 text-xl font-semibold text-zinc-950 dark:text-zinc-50">Dashboard</h2>
        </div>
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-500 text-white"
        >
          RF
        </motion.div>
      </div>

      <div className="flex flex-col gap-3">
        {navItems.map((item) => {
          const isActive = item.href !== "/dashboard#reports" && item.href !== "/dashboard#settings" && pathname.startsWith(item.href.replace(/#.*/, ""));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                `rounded-3xl px-4 py-3 text-sm font-medium transition flex items-center justify-between touch-target ` +
                (isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/60 dark:text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white")
              }
            >
              <span>{item.label}</span>
              {isActive ? <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-indigo-600" /> : null}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto rounded-3xl border border-zinc-200/80 bg-zinc-50 p-5 dark:border-zinc-800/80 dark:bg-zinc-900/80">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">Live alerts</p>
        <div className="mt-4 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
          <p>• 12 bookings need confirmation</p>
          <p>• 8 inventory items low stock</p>
          <p>• 3 deliveries scheduled today</p>
        </div>
      </div>
    </aside>
  );
}
