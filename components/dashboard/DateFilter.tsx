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
    <div className="flex flex-wrap gap-2">
      <input value={start} onChange={(e) => setStart(e.target.value)} type="date" className="field-input h-10 w-auto" />
      <input value={end} onChange={(e) => setEnd(e.target.value)} type="date" className="field-input h-10 w-auto" />
      <button type="button" onClick={apply} className="inline-flex h-10 items-center rounded-xl bg-cyan-400/15 px-4 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/25">
        Apply
      </button>
    </div>
  );
}
