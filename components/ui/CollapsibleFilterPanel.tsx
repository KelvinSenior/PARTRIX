"use client";

import { useEffect, useState } from "react";
import { Filter } from "lucide-react";

export default function CollapsibleFilterPanel({
  title,
  description,
  children,
  activeCount = 0,
  defaultOpen = false,
  storageKey,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  activeCount?: number;
  defaultOpen?: boolean;
  storageKey?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    const storedValue = window.localStorage.getItem(storageKey);
    if (storedValue === "true") {
      setIsOpen(true);
    } else if (storedValue === "false") {
      setIsOpen(false);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    window.localStorage.setItem(storageKey, String(isOpen));
  }, [isOpen, storageKey]);

  return (
    <div className="relative w-fit self-start">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/95 text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 dark:border-cyan-200/20 dark:bg-slate-900/80 dark:text-cyan-100 dark:hover:bg-slate-800"
        aria-label={title}
        title={description ?? title}
      >
        <Filter className="h-4 w-4" />
        {activeCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-cyan-600 px-1 text-[10px] font-semibold text-white">
            {activeCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-3 pt-4 sm:px-6 sm:pt-6">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/25 backdrop-blur-[2px]"
            aria-label="Close filter panel"
          />
          <div className="relative w-full max-w-[min(52rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/70 p-2.5 shadow-[0_20px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:p-3 dark:border-cyan-200/10 dark:bg-[#060b1a]/95">
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}
