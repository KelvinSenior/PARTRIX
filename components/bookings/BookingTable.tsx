import Link from "next/link";
import type { BookingDTO } from "@/types/booking";
import { appCard, appCardInner, appEyebrow, appTitle } from "@/lib/appStyles";
import { Eye } from "lucide-react";

const statusStyles: Record<string, string> = {
  PENDING: "border border-amber-300/80 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/15 dark:text-amber-200",
  CONFIRMED: "border border-emerald-300/80 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/15 dark:text-emerald-200",
  IN_PROGRESS: "border border-cyan-300/80 bg-cyan-50 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/15 dark:text-cyan-200",
  COMPLETED: "border border-emerald-300/80 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/15 dark:text-emerald-200",
  CANCELLED: "border border-rose-300/80 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/15 dark:text-rose-200",
  NO_SHOW: "border border-slate-300/80 bg-slate-100 text-slate-700 dark:border-zinc-500/20 dark:bg-zinc-500/20 dark:text-zinc-300",
};

function formatStatus(status: string) {
  return status.replace("_", " ");
}

export default function BookingTable({ bookings }: { bookings: BookingDTO[] }) {
  return (
    <section className={appCard}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className={appEyebrow}>All bookings</p>
          <h2 className={`${appTitle} mt-2 text-xl`}>
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
          </h2>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className={`${appCardInner} py-10 text-center text-sm text-slate-600 dark:text-zinc-500`}>
          No bookings match your search.
        </div>
      ) : (
        <div className="-mx-1 overflow-x-auto">
          <table className="min-w-[780px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 text-xs uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:text-zinc-500">
                <th className="px-3 py-3">Booking</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Event date</th>
                <th className="px-3 py-3">Return date</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Balance</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-slate-200/70 transition hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-3.5">
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="font-mono text-sm font-medium text-cyan-700 hover:text-cyan-800 dark:text-cyan-200 dark:hover:text-cyan-100"
                    >
                      {booking.bookingNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-3.5">
                    <p className="font-medium text-slate-900 dark:text-zinc-200">
                      {booking.customer.firstName} {booking.customer.lastName}
                    </p>
                    {booking.customer.email && (
                      <p className="text-xs text-slate-500 dark:text-zinc-500">{booking.customer.email}</p>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-zinc-400">
                    {new Date(booking.eventDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-3 py-3.5 text-zinc-400">
                    {booking.returnDate
                      ? new Date(booking.returnDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="px-3 py-3.5">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[booking.status] ?? statusStyles.PENDING}`}
                    >
                      {formatStatus(booking.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 font-medium text-slate-900 dark:text-white">
                    GHC{booking.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-3 py-3.5">
                    <span
                      className={
                        booking.balanceDue > 0 ? "font-medium text-amber-700 dark:text-amber-200" : "text-emerald-700 dark:text-emerald-300"
                      }
                    >
                      GHC{booking.balanceDue.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-cyan-200/60 bg-cyan-50 px-3 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-200/20 dark:bg-cyan-400/10 dark:text-cyan-200 dark:hover:bg-cyan-400/20"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
