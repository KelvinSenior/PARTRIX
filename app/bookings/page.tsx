import { redirect } from "next/navigation";
import BookingForm from "@/components/bookings/BookingForm";
import BookingTable from "@/components/bookings/BookingTable";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import { listBookings } from "@/services/booking";
import { appCard } from "@/lib/appStyles";

export default async function BookingsPage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");

  if (!user) {
    redirect("/login");
  }

  const bookingsResult = await listBookings();

  return (
    <AppShell user={user} showFab={false}>
      <PageHeader
        eyebrow="Booking management"
        title="Bookings"
        description="Create and manage event rentals with availability checks, fees, and returns."
      />

      <div className={appCard}>
        <BookingForm />
      </div>

      <BookingTable bookings={bookingsResult.bookings} />
    </AppShell>
  );
}
