"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type AuthPrimaryButtonProps = {
  isLoading: boolean;
  label: string;
  loadingLabel: string;
};

export default function AuthPrimaryButton({ isLoading, label, loadingLabel }: AuthPrimaryButtonProps) {
  return (
    <motion.button
      type="submit"
      disabled={isLoading}
      whileTap={{ scale: 0.985 }}
      whileHover={{ y: -1 }}
      className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 text-base font-semibold text-slate-950 shadow-[0_8px_28px_rgba(14,165,233,0.45)] transition disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </motion.button>
  );
}
