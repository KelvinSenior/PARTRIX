import type { ReactNode } from "react";

const mergeClasses = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export default function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={mergeClasses(
        "rounded-2xl border border-cyan-200/10 bg-white/[0.04] p-5 shadow-[0_8px_32px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:rounded-3xl sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
