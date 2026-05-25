"use client";

const bookings = [
  { id: "RF-1032", customer: "Olivia Smith", status: "Confirmed", date: "May 20" },
  { id: "RF-1029", customer: "Jason Lee", status: "Pending", date: "May 19" },
  { id: "RF-1024", customer: "Mia Santos", status: "Delivered", date: "May 18" },
  { id: "RF-1018", customer: "Noah Patel", status: "Confirmed", date: "May 17" },
];

const statusStyles: Record<string, string> = {
  Confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Delivered: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
};

export default function RecentBookings() {
  return (
    <div id="bookings" className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm shadow-zinc-200/30 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-zinc-950/15">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Recent bookings</p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Quick snapshot</h2>
        </div>
        <button className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800">
          View all
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-zinc-200/75 bg-zinc-50 p-4 dark:border-zinc-800/70 dark:bg-zinc-900/90">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">{booking.customer}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{booking.id}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[booking.status]}`}>
                {booking.status}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{booking.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
