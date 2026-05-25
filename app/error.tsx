"use client";

import { useEffect } from "react";
import Link from "next/link";

interface GlobalErrorProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-10 text-center dark:bg-zinc-950">
      <div className="mx-auto max-w-xl rounded-[32px] border border-zinc-200/80 bg-white/95 p-10 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Something went wrong</p>
        <h1 className="mt-4 text-3xl font-semibold text-zinc-950 dark:text-zinc-50">Unable to load this page</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">An unexpected error occurred while rendering the page. Please refresh or return to safety.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700">
            Try again
          </button>
          <Link href="/" className="rounded-2xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
