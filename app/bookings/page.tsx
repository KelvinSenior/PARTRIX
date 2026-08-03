import { redirect } from "next/navigation";
import BookingForm from "@/components/bookings/BookingForm";
import BookingTable from "@/components/bookings/BookingTable";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import { listBookings } from "@/services/booking";
import { getOrganizationSettings } from "@/services/settings";
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
  const settings = await getOrganizationSettings();

  return (
    <AppShell user={user} showFab={false}>
      <PageHeader
        eyebrow="Booking management"
        title="Bookings"
        description="Create and manage rental bookings with availability checks, fees, and returns."
      />

      <div className={appCard}>
        <BookingForm settings={settings} />
      </div>

      <div className="space-y-3">
        <BookingTable bookings={bookingsResult.bookings} settings={settings} />
      </div>
    </AppShell>
  );
}
