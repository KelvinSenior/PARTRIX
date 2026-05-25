import type { ReactNode } from "react";

const mergeClasses = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export default function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={mergeClasses("rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm shadow-zinc-200/30 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-zinc-950/20", className)}>
      {children}
    </div>
  );
}
