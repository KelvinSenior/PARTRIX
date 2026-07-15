import type { ReactNode } from "react";

const mergeClasses = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export default function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={mergeClasses(
        "rounded-2xl border border-slate-200/80 bg-white/95 p-5 text-slate-900 shadow-[0_8px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-3xl sm:p-6 dark:border-cyan-200/10 dark:bg-white/[0.04] dark:text-zinc-100 dark:shadow-[0_8px_32px_rgba(2,6,23,0.35)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
