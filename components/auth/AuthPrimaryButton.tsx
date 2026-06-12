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
      className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#22D3EE] px-5 text-base font-semibold text-[#050816] shadow-[0_8px_28px_rgba(34,211,238,0.35)] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
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
