"use client";

import { type InputHTMLAttributes } from "react";
import { type LucideIcon } from "lucide-react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: LucideIcon;
  hint?: string;
};

export default function AuthInput({ label, icon: Icon, hint, className = "", ...props }: AuthInputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-zinc-200">
      <span className="font-medium tracking-wide text-slate-600 dark:text-zinc-300">{label}</span>
      <div className="group relative">
        <Icon
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-600/70 transition-colors group-focus-within:text-cyan-700 dark:text-cyan-300/70 dark:group-focus-within:text-cyan-200"
        />
        <input
          {...props}
          className={`h-14 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-cyan-600 focus:shadow-[0_0_0_2px_rgba(8,145,178,0.16)] dark:border-cyan-300/20 dark:bg-[#101a2f]/90 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-cyan-300/70 dark:focus:shadow-[0_0_0_2px_rgba(34,211,238,0.2),0_0_24px_rgba(14,165,233,0.22)] ${className}`}
        />
      </div>
      {hint ? <span className="text-xs text-slate-500 dark:text-zinc-400">{hint}</span> : null}
    </label>
  );
}
