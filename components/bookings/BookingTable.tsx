"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BookingDTO } from "@/types/booking";
import type { SettingsDTO } from "@/types/settings";
import { appCard, appCardInner, appEyebrow, appTitle } from "@/lib/appStyles";
import { formatAmount } from "@/lib/branding";
import { Eye, Search } from "lucide-react";
import CollapsibleFilterPanel from "@/components/ui/CollapsibleFilterPanel";

const statusStyles: Record<string, string> = {
  PENDING: "border border-amber-300/80 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/15 dark:text-amber-200",
  CONFIRMED: "border border-emerald-300/80 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/15 dark:text-emerald-200",
  IN_PROGRESS: "border border-cyan-300/80 bg-cyan-50 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/15 dark:text-cyan-200",
  COMPLETED: "border border-emerald-300/80 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/15 dark:text-emerald-200",
  CANCELLED: "border border-rose-300/80 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/15 dark:text-rose-200",
  NO_SHOW: "border border-slate-300/80 bg-slate-100 text-slate-700 dark:border-zinc-500/20 dark:bg-zinc-500/20 dark:text-zinc-300",
};

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export default function BookingTable({ bookings, settings }: { bookings: BookingDTO[]; settings: SettingsDTO }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [customer, setCustomer] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [compact, setCompact] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    returnDate: true,
    status: true,
    total: true,
    balance: true,
  });

  const customers = useMemo(() => {
    const names = new Set(bookings.map((booking) => `${booking.customer.firstName} ${booking.customer.lastName}`.trim()));
    return Array.from(names).filter(Boolean).sort();
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`.trim();
      const eventDate = booking.eventDate.slice(0, 10);
      const matchesQuery = !needle || [
        booking.bookingNumber,
        customerName,
        booking.customer.email ?? "",
        booking.status,
      ].some((value) => value.toLowerCase().includes(needle));
      return (
        matchesQuery &&
        (status === "all" || booking.status === status) &&
        (customer === "all" || customerName === customer) &&
        (!from || eventDate >= from) &&
        (!to || eventDate <= to)
      );
    });
  }, [bookings, customer, from, query, status, to]);

  const totalPages = Math.max(Math.ceil(filteredBookings.length / rowsPerPage), 1);
  const currentPage = Math.min(page, totalPages);
  const visibleBookings = filteredBookings.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const cellPadding = compact ? "py-2" : "py-3.5";

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setCustomer("all");
    setFrom("");
    setTo("");
    setPage(1);
  }

  return (
    <section className={appCard}>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className={appEyebrow}>All bookings</p>
          <h2 className={`${appTitle} mt-2 text-xl`}>
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""}
          </h2>
        </div>
      </div>

      <div className="sticky top-4 z-20 mb-4 rounded-2xl border border-cyan-200/10 bg-[#050816]/88 p-3 shadow-[0_14px_42px_rgba(2,6,23,0.32)] backdrop-blur-xl">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_150px]">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search booking, customer, email, status..."
                className="h-11 w-full rounded-xl border border-cyan-200/15 bg-[#050816]/80 pl-10 pr-4 text-sm text-white outline-none focus:border-cyan-300/60"
              />
            </div>
            <CollapsibleFilterPanel title="Table controls" description="Refine bookings by customer, date, and display preferences" activeCount={[customer !== "all", from, to, compact].filter(Boolean).length} storageKey="partrix-bookings-table-filters-open">
              <div className="grid gap-2.5 rounded-2xl border border-white/10 bg-white/3 p-2.5 sm:p-3 md:grid-cols-5">
                <select value={customer} onChange={(event) => { setCustomer(event.target.value); setPage(1); }} className="h-11 rounded-xl border border-cyan-200/15 bg-[#050816]/80 px-4 text-sm text-white">
                  <option value="all">All customers</option>
                  {customers.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <input aria-label="Filter bookings from date" placeholder="From" type="date" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1); }} className="h-11 rounded-xl border border-cyan-200/15 bg-[#050816]/80 px-4 text-sm text-white" />
                <input aria-label="Filter bookings to date" placeholder="To" type="date" value={to} onChange={(event) => { setTo(event.target.value); setPage(1); }} className="h-11 rounded-xl border border-cyan-200/15 bg-[#050816]/80 px-4 text-sm text-white" />
                <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-cyan-200/15 bg-[#050816]/80 px-4 text-sm text-zinc-200">
                  <input type="checkbox" checked={compact} onChange={(event) => setCompact(event.target.checked)} />
                  Compact mode
                </label>
                <button type="button" onClick={resetFilters} className="h-11 rounded-xl border border-cyan-200/20 px-4 text-sm font-semibold text-cyan-100">
                  Reset filters
                </button>
                <div className="flex flex-wrap gap-3 text-sm text-zinc-300 md:col-span-5">
                  {Object.entries(visibleColumns).map(([key, checked]) => (
                    <label key={key} className="inline-flex items-center gap-2 capitalize">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => setVisibleColumns((current) => ({ ...current, [key]: event.target.checked }))}
                      />
                      {key.replace(/([A-Z])/g, " $1")}
                    </label>
                  ))}
                </div>
              </div>
            </CollapsibleFilterPanel>
          </div>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-11 rounded-xl border border-cyan-200/15 bg-[#050816]/80 px-4 text-sm text-white">
            <option value="all">All statuses</option>
            {Object.keys(statusStyles).map((item) => <option key={item} value={item}>{formatStatus(item)}</option>)}
          </select>
          <select value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(1); }} className="h-11 rounded-xl border border-cyan-200/15 bg-[#050816]/80 px-4 text-sm text-white">
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
          </select>
        </div>
      </div>


      {filteredBookings.length === 0 ? (
        <div className={`${appCardInner} py-10 text-center text-sm text-slate-600 dark:text-zinc-500`}>
          No bookings match your search.
        </div>
      ) : (
        <div className="-mx-1 overflow-x-auto">
          <table className="min-w-195 text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 text-xs uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:text-zinc-500">
                <th className="px-3 py-3">Booking</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Event date</th>
                {visibleColumns.returnDate ? <th className="px-3 py-3">Return date</th> : null}
                {visibleColumns.status ? <th className="px-3 py-3">Status</th> : null}
                {visibleColumns.total ? <th className="px-3 py-3">Total</th> : null}
                {visibleColumns.balance ? <th className="px-3 py-3">Balance</th> : null}
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-slate-200/70 transition hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/2">
                  <td className={`px-3 ${cellPadding}`}>
                    <Link href={`/bookings/${booking.id}`} className="font-mono text-sm font-medium text-cyan-700 hover:text-cyan-800 dark:text-cyan-200 dark:hover:text-cyan-100">
                      {booking.bookingNumber}
                    </Link>
                  </td>
                  <td className={`px-3 ${cellPadding}`}>
                    <p className="font-medium text-slate-900 dark:text-zinc-200">{booking.customer.firstName} {booking.customer.lastName}</p>
                    {booking.customer.email ? <p className="text-xs text-slate-500 dark:text-zinc-500">{booking.customer.email}</p> : null}
                  </td>
                  <td className={`px-3 text-zinc-400 ${cellPadding}`}>{new Date(booking.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  {visibleColumns.returnDate ? (
                    <td className={`px-3 text-zinc-400 ${cellPadding}`}>
                      {booking.returnDate ? new Date(booking.returnDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : <span className="text-zinc-600">-</span>}
                    </td>
                  ) : null}
                  {visibleColumns.status ? (
                    <td className={`px-3 ${cellPadding}`}>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[booking.status] ?? statusStyles.PENDING}`}>
                        {formatStatus(booking.status)}
                      </span>
                    </td>
                  ) : null}
                  {visibleColumns.total ? <td className={`px-3 font-medium text-slate-900 dark:text-white ${cellPadding}`}>{formatAmount(booking.totalAmount, settings)}</td> : null}
                  {visibleColumns.balance ? (
                    <td className={`px-3 ${cellPadding}`}>
                      <span className={booking.balanceDue > 0 ? "font-medium text-amber-700 dark:text-amber-200" : "text-emerald-700 dark:text-emerald-300"}>
                        {formatAmount(booking.balanceDue, settings)}
                      </span>
                    </td>
                  ) : null}
                  <td className={`px-3 ${cellPadding}`}>
                    <Link href={`/bookings/${booking.id}`} className="inline-flex h-8 items-center gap-1 rounded-lg border border-cyan-200/60 bg-cyan-50 px-3 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-200/20 dark:bg-cyan-400/10 dark:text-cyan-200 dark:hover:bg-cyan-400/20">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">Page {currentPage} of {totalPages}</p>
            <div className="flex gap-2">
              <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(value - 1, 1))} className="rounded-xl border border-cyan-200/20 px-4 py-2 text-sm text-cyan-100 disabled:opacity-40">
                Previous
              </button>
              <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(value + 1, totalPages))} className="rounded-xl border border-cyan-200/20 px-4 py-2 text-sm text-cyan-100 disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
