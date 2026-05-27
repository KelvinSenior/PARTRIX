"use client";

import Link from "next/link";
import type { BookingDTO } from "@/types/booking";
import { appBtnSecondary, appCard, appCardInner, appEyebrow, appTitle } from "@/lib/appStyles";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-400/15 text-amber-200",
  CONFIRMED: "bg-emerald-400/15 text-emerald-200",
  IN_PROGRESS: "bg-cyan-400/15 text-cyan-200",
  COMPLETED: "bg-emerald-400/15 text-emerald-200",
  CANCELLED: "bg-rose-400/15 text-rose-200",
  NO_SHOW: "bg-zinc-500/20 text-zinc-300",
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
                <p className="truncate text-sm font-semibold text-white">
                  {booking.customer.firstName} {booking.customer.lastName}
                </p>
                <p className="text-xs text-zinc-500">{booking.bookingNumber}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[booking.status] ?? statusStyles.PENDING}`}>
                  {booking.status}
                </span>
                <span className="text-xs text-zinc-400">
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
