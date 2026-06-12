"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarPlus, PackagePlus, Receipt } from "lucide-react";
import { appCard, appEyebrow, appTitle } from "@/lib/appStyles";

const actions = [
  {
    label: "New booking",
    description: "Create a rental booking",
    href: "/bookings",
    tone: "from-cyan-500 to-blue-600",
    icon: CalendarPlus,
  },
  {
    label: "Add inventory",
    description: "Update stock levels",
    href: "/inventory",
    tone: "from-emerald-500 to-teal-600",
    icon: PackagePlus,
  },
  {
    label: "Record payment",
    description: "Log customer payment",
    href: "/finance",
    tone: "from-violet-500 to-indigo-600",
    icon: Receipt,
  },
];

export default function QuickActions() {
  return (
    <div className={appCard}>
      <p className={appEyebrow}>Quick actions</p>
      <h2 className={`${appTitle} mt-2 text-xl`}>Move faster</h2>

      <div className="mt-5 grid gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.div key={action.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
              <Link
                href={action.href}
                className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r ${action.tone} px-4 py-3.5 text-white shadow-lg`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{action.label}</span>
                  <span className="block text-xs text-white/80">{action.description}</span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
