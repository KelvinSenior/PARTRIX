"use client";

import Link from "next/link";
import type { BookingDTO } from "@/types/booking";
import { appBtnSecondary, appCard, appCardInner, appEyebrow, appTitle } from "@/lib/appStyles";

const statusStyles: Record<string, string> = {
  PENDING: "border border-amber-300/80 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/15 dark:text-amber-200",
  CONFIRMED: "border border-emerald-300/80 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/15 dark:text-emerald-200",
  IN_PROGRESS: "border border-cyan-300/80 bg-cyan-50 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/15 dark:text-cyan-200",
  COMPLETED: "border border-emerald-300/80 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/15 dark:text-emerald-200",
  CANCELLED: "border border-rose-300/80 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/15 dark:text-rose-200",
  NO_SHOW: "border border-slate-300/80 bg-slate-100 text-slate-700 dark:border-zinc-500/20 dark:bg-zinc-500/20 dark:text-zinc-300",
};

export default function RecentBookings({ bookings }: { bookings: BookingDTO[] }) {
  const recentBookings = bookings.slice(0, 6);

  return (
    <div id="bookings" className={appCard}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={appEyebrow}>Recent bookings</p>
          <h2 className={`${appTitle} mt-2 text-xl`}>Activity feed</h2>
        </div>
        <Link href="/bookings" className={appBtnSecondary}>
          View all
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {recentBookings.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">No bookings yet</p>
        ) : (
          recentBookings.map((booking) => (
            <div key={booking.id} className={`${appCardInner} flex flex-wrap items-center justify-between gap-3`}>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {booking.customer.firstName} {booking.customer.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-500">{booking.bookingNumber}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[booking.status] ?? statusStyles.PENDING}`}>
                  {booking.status}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  {new Date(booking.eventDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
