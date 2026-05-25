"use client";

import { AlertTriangle } from "lucide-react";

export default function InventoryError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 text-zinc-950 dark:bg-black dark:text-zinc-100">
      <div className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <AlertTriangle className="mx-auto h-10 w-10 text-rose-600" />
        <h1 className="mt-4 text-2xl font-semibold">
          Inventory could not load
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {error.message}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
        >
          Try again
        </button>
      </div>
    </main>
  );
}

