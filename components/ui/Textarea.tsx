import type { TextareaHTMLAttributes } from "react";

const mergeClasses = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export default function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={mergeClasses(
        "w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-black focus:ring-2 focus:ring-sky-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/20",
        className,
      )}
    />
  );
}
