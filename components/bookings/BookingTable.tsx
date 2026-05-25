import Link from "next/link";
import type { BookingDTO } from "@/types/booking";

export default function BookingTable({ bookings }: { bookings: BookingDTO[] }) {
  return (
    <section className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm shadow-zinc-200/30 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-zinc-950/15">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Bookings</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Recent rentals</h2>
        </div>
        <Link
          href="/bookings"
          className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          Manage bookings
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-zinc-700 dark:text-zinc-300">
          <thead className="border-b border-zinc-200 text-xs uppercase tracking-[0.25em] text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {bookings.slice(0, 6).map((booking) => (
              <tr key={booking.id} className="border-b border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-4 font-medium text-zinc-950 dark:text-zinc-100">{booking.bookingNumber}</td>
                <td className="px-4 py-4">{booking.customer.firstName} {booking.customer.lastName}</td>
                <td className="px-4 py-4">{new Date(booking.eventDate).toLocaleDateString()}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-4">${booking.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
