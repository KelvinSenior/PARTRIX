import { redirect } from "next/navigation";
import { Suspense } from "react";
import BookingForm from "@/components/bookings/BookingForm";
import BookingTable from "@/components/bookings/BookingTable";
import BookingFilters from "@/components/bookings/BookingFilters";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import { listBookings } from "@/services/booking";
import { appCard } from "@/lib/appStyles";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");

  if (!user) {
    redirect("/login");
  }

  const sp = await searchParams;
  const bookingsResult = await listBookings({
    search: sp?.q,
    status: sp?.status,
  });

  return (
    <AppShell user={user} showFab={false}>
      <PageHeader
        eyebrow="Booking management"
        title="Bookings"
        description="Create and manage rental bookings with availability checks, fees, and returns."
      />

      <div className={appCard}>
        <BookingForm />
      </div>

      <div className="space-y-3">
        <Suspense>
          <BookingFilters />
        </Suspense>
        <BookingTable bookings={bookingsResult.bookings} />
      </div>
    </AppShell>
  );
}
