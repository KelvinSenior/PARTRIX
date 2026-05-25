"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DateFilter({ start: initialStart, end: initialEnd }: { start?: string; end?: string }) {
  const router = useRouter();
  const [start, setStart] = useState(initialStart ?? "");
  const [end, setEnd] = useState(initialEnd ?? "");

  function apply() {
    const params = new URLSearchParams();
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    router.push(`${window.location.pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      <input value={start} onChange={(e) => setStart(e.target.value)} type="date" className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400" />
      <input value={end} onChange={(e) => setEnd(e.target.value)} type="date" className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400" />
      <button onClick={apply} className="rounded-md bg-sky-600 px-3 py-2 text-white hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600">Apply</button>
    </div>
  );
}
