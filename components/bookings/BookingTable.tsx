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

export default function BookingTable({ bookings }: { bookings: BookingDTO[] }) {
  return (
    <section className={appCard}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className={appEyebrow}>All bookings</p>
          <h2 className={`${appTitle} mt-2 text-xl`}>Recent rentals</h2>
        </div>
        <Link href="/bookings" className={appBtnSecondary}>
          Refresh
        </Link>
      </div>

      <div className="-mx-1 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-zinc-500">
              <th className="px-3 py-3">Booking</th>
              <th className="px-3 py-3">Customer</th>
              <th className="px-3 py-3">Event</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {bookings.slice(0, 12).map((booking) => (
              <tr key={booking.id} className="border-b border-white/5">
                <td className="px-3 py-3.5">
                  <Link href={`/bookings/${booking.id}`} className="font-medium text-cyan-100 hover:text-cyan-200">
                    {booking.bookingNumber}
                  </Link>
                </td>
                <td className="px-3 py-3.5 text-zinc-300">
                  {booking.customer.firstName} {booking.customer.lastName}
                </td>
                <td className="px-3 py-3.5 text-zinc-400">
                  {new Date(booking.eventDate).toLocaleDateString()}
                </td>
                <td className="px-3 py-3.5">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[booking.status] ?? statusStyles.PENDING}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-3 py-3.5 font-medium text-white">${booking.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bookings.length === 0 ? (
        <div className={`${appCardInner} mt-4 py-8 text-center text-sm text-zinc-500`}>No bookings found</div>
      ) : null}
    </section>
  );
}
