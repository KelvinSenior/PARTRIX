"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { appInput, appBtnPrimary, appBtnSecondary } from "@/lib/appStyles";
import CollapsibleFilterPanel from "@/components/ui/CollapsibleFilterPanel";

const STATUSES = [
  { value: "all", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No show" },
];

export default function BookingFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [search, setSearch] = useState(sp.get("q") ?? "");
  const [status, setStatus] = useState(sp.get("status") ?? "all");

  const applyFilters = useCallback(
    (q: string, s: string) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (s && s !== "all") params.set("status", s);
      router.push(`/bookings?${params.toString()}`);
    },
    [router],
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilters(search, status);
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const s = e.target.value;
    setStatus(s);
    applyFilters(search, s);
  }

  function clearFilters() {
    setSearch("");
    setStatus("all");
    router.push("/bookings");
  }

  const hasFilters = search || status !== "all";

  return (
    <form onSubmit={handleSearch} className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:min-w-55">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden />
            <input
              type="text"
              placeholder="Search by booking #, customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${appInput} w-full pl-10`}
            />
          </div>
          <CollapsibleFilterPanel title="Advanced filters" description="Refine results by booking status" activeCount={status !== "all" ? 1 : 0} storageKey="partrix-bookings-filters-open">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                <span className="mb-2 block">Status</span>
                <select value={status} onChange={handleStatusChange} className={`${appInput} w-full`}>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </CollapsibleFilterPanel>
        </div>
        <button type="submit" className={`${appBtnPrimary} w-full md:w-auto`}>
          Search
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className={`${appBtnSecondary} w-full gap-1.5 md:w-auto`}
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
    </form>
  );
}
