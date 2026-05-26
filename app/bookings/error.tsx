"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Bookings page error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto grid max-w-[1800px] gap-6 px-4 py-6 lg:px-8">
        <div className="rounded-[32px] border border-rose-200/80 bg-rose-50/95 p-8 shadow-lg shadow-rose-200/40 backdrop-blur-xl dark:border-rose-800/70 dark:bg-rose-950/95 dark:shadow-rose-950/20">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-600 dark:text-rose-400">Error</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-rose-900 dark:text-rose-50">Unable to load bookings</h1>
          <p className="mt-3 max-w-2xl text-rose-700 dark:text-rose-300">
            {error.message || "An unexpected error occurred while loading the bookings page. Please try again."}
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-2xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
