"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { INVENTORY_ADD_EVENT } from "@/lib/appEvents";

type FloatingActionButtonProps = {
  href?: string;
  label?: string;
  action?: "add-inventory";
};

export default function FloatingActionButton({
  href = "/bookings",
  label = "New booking",
  action,
}: FloatingActionButtonProps) {
  const content = (
    <>
      <Plus className="h-5 w-5" aria-hidden />
      <span className="hidden xs:inline sm:inline">{label}</span>
    </>
  );
  const className =
    "pointer-events-auto inline-flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 text-sm font-semibold text-slate-950 shadow-[0_12px_32px_rgba(14,165,233,0.45)] transition hover:brightness-105";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fab-container pointer-events-none fixed z-50"
    >
      {action === "add-inventory" ? (
        <button
          type="button"
          aria-label={label}
          className={className}
          onClick={() => window.dispatchEvent(new Event(INVENTORY_ADD_EVENT))}
        >
          {content}
        </button>
      ) : (
        <Link href={href} aria-label={label} className={className}>
          {content}
        </Link>
      )}
    </motion.div>
  );
}
