import { redirect } from "next/navigation";
import BookingForm from "@/components/bookings/BookingForm";
import BookingTable from "@/components/bookings/BookingTable";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import { listBookings } from "@/services/booking";

export default async function BookingsPage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");

  if (!user) {
    redirect("/login");
  }

  const bookingsResult = await listBookings();

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto grid max-w-[1800px] gap-6 px-4 py-6 lg:px-8">
        <div className="space-y-4">
          <div className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-8 shadow-lg shadow-zinc-200/40 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/95 dark:shadow-zinc-950/20">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Booking management</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">Create and manage rental bookings</h1>
            <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Build event rentals with timeline-aware availability checks, inventory hold handling, fees, discounts, and return management.
            </p>
          </div>

          <BookingForm />
        </div>

        <BookingTable bookings={bookingsResult.bookings} />
      </div>
    </main>
  );
}
