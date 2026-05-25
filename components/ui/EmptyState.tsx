import type { ReactNode } from "react";

const mergeClasses = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={mergeClasses("rounded-[32px] border border-dashed border-zinc-300/80 bg-white/90 p-10 text-center shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/85", className)}>
      <p className="text-sm uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">Nothing here yet</p>
      <h2 className="mt-4 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">{title}</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
