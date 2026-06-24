"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { appInput, appBtnPrimary, appBtnSecondary } from "@/lib/appStyles";

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
    <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden />
        <input
          type="text"
          placeholder="Search by booking #, customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${appInput} pl-10`}
        />
      </div>
      <select
        value={status}
        onChange={handleStatusChange}
        className={`${appInput} w-auto`}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <button type="submit" className={appBtnPrimary}>
        Search
      </button>
      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className={`${appBtnSecondary} gap-1.5`}
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </form>
  );
}
