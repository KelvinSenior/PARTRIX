import type { HTMLAttributes } from "react";

const mergeClasses = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export default function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={mergeClasses("animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800", className)} />;
}
