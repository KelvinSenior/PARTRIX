"use client";

import { motion } from "framer-motion";
import type { BookingDTO } from "@/types/booking";
import { appCard, appEyebrow } from "@/lib/appStyles";

function getBookingsPerDay(bookings: BookingDTO[]) {
  const dayMap: Record<string, number> = {};
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Initialize all days
  days.forEach(day => {
    dayMap[day] = 0;
  });

  // Count bookings by day of week
  bookings.forEach(booking => {
    const date = new Date(booking.eventDate);
    const dayName = days[date.getDay()];
    dayMap[dayName]++;
  });

  return days.map(day => ({ label: day, value: dayMap[day] }));
}

export default function BookingChart({ bookings }: { bookings: BookingDTO[] }) {
  const barsData = getBookingsPerDay(bookings);
  const totalBookings = bookings.length;
  const maxValue = Math.max(...barsData.map(b => b.value), 1);

  return (
    <div className={appCard}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={appEyebrow}>Bookings</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">{totalBookings} total</h2>
        </div>
        <span className="rounded-full bg-cyan-400/15 px-3 py-1.5 text-xs font-semibold text-cyan-200">By weekday</span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-7">
        {barsData.map((bar) => (
          <div key={bar.label} className="flex flex-col items-center gap-3">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(bar.value / Math.max(maxValue, 1)) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex h-32 w-full max-w-[40px] items-end rounded-3xl bg-gradient-to-t from-[#0B1020] to-[#22D3EE]"
            >
              <span className="sr-only">{bar.value} bookings</span>
            </motion.div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
