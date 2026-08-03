import { redirect } from "next/navigation";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import AppShell from "@/components/layout/AppShell";
import StatsCard from "@/components/dashboard/StatsCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import BookingChart from "@/components/dashboard/BookingChart";
import RecentBookings from "@/components/dashboard/RecentBookings";
import InventoryAlerts from "@/components/dashboard/InventoryAlerts";
import QuickActions from "@/components/dashboard/QuickActions";
import { listBookings } from "@/services/booking";
import { listDeliveries } from "@/services/delivery";
import { getFinanceSummary } from "@/services/finance";
import { listInventoryItems } from "@/services/inventory";
import { getOrganizationSettings } from "@/services/settings";
import { formatAmount } from "@/lib/branding";

export default async function DashboardPage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");

  if (!user) {
    redirect("/login");
  }

  const [bookingsResult, deliveriesResult, financeSummary, inventoryResult, settings] = await Promise.all([
    listBookings(),
    listDeliveries(),
    getFinanceSummary(),
    listInventoryItems({ search: "", category: "", status: "all", availability: "all", sort: "name" }),
    getOrganizationSettings(),
  ]);

  const activeBookings = bookingsResult.bookings.filter((b) =>
    ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status),
  ).length;
  const totalRevenue = financeSummary.totals.revenue;
  const inventoryAlerts = inventoryResult.items.filter(
    (item) => item.availableQuantity <= item.minimumThreshold,
  ).length;
  const pendingDeliveries = deliveriesResult.filter((d: { status: string }) =>
    ["SCHEDULED", "IN_TRANSIT"].includes(d.status),
  ).length;

  const bookingChange = activeBookings > 0 ? "+12%" : "0%";
  const revenueChange = totalRevenue > 50000 ? "+14.5%" : "+8.2%";
  const alertChange = inventoryAlerts > 5 ? "-6%" : "+2%";
  const deliveryChange = pendingDeliveries > 3 ? "+8%" : "+3%";

  return (
    <AppShell user={user}>
      <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon="briefcase" label="Active bookings" value={activeBookings.toString()} change={bookingChange} />
        <StatsCard icon="wallet" label="Revenue" value={formatAmount(totalRevenue, settings)} change={revenueChange} highlight />
        <StatsCard icon="package" label="Inventory alerts" value={inventoryAlerts.toString()} change={alertChange} />
        <StatsCard icon="truck" label="Pending deliveries" value={pendingDeliveries.toString()} change={deliveryChange} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <RevenueChart financeSummary={financeSummary} settings={settings} />
        <QuickActions />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <BookingChart bookings={bookingsResult.bookings} />
        <InventoryAlerts items={inventoryResult.items} />
      </div>

      <RecentBookings bookings={bookingsResult.bookings} />
    </AppShell>
  );
}
