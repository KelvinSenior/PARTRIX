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
import { countActiveBookings, listBookings } from "@/services/booking";
import { listDeliveries } from "@/services/delivery";
import { getFinanceSummary } from "@/services/finance";
import { listInventoryItems } from "@/services/inventory";
import { getOrganizationSettings } from "@/services/settings";
import { formatAmount } from "@/lib/branding";
import { hasPermission } from "@/lib/rolePolicy";

export default async function DashboardPage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");

  if (!user) {
    redirect("/login");
  }

  const [bookingsResult, activeBookings, deliveriesResult, financeSummary, inventoryResult, settings] = await Promise.all([
    listBookings(),
    countActiveBookings(),
    listDeliveries(),
    hasPermission(user.role, "finance:read")
      ? getFinanceSummary()
      : Promise.resolve({ totals: { revenue: 0, expenses: 0, profit: 0, outstanding: 0 }, monthly: [] }),
    listInventoryItems({ search: "", category: "", status: "all", availability: "all", sort: "name" }),
    getOrganizationSettings(),
  ]);

  const canReadFinance = hasPermission(user.role, "finance:read");
  const totalRevenue = financeSummary.totals.revenue;
  const inventoryAlerts = inventoryResult.items.filter(
    (item) => item.availableQuantity <= item.minimumThreshold,
  ).length;
  const pendingDeliveries = deliveriesResult.filter((d: { status: string }) =>
    ["SCHEDULED", "IN_TRANSIT"].includes(d.status),
  ).length;

  return (
    <AppShell user={user}>
      <div className={`grid auto-rows-fr gap-4 md:grid-cols-2 ${canReadFinance ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
        <StatsCard icon="briefcase" label="Active bookings" value={activeBookings.toString()} />
        {canReadFinance ? <StatsCard icon="wallet" label="Revenue" value={formatAmount(totalRevenue, settings)} highlight /> : null}
        <StatsCard icon="package" label="Inventory alerts" value={inventoryAlerts.toString()} />
        <StatsCard icon="truck" label="Pending deliveries" value={pendingDeliveries.toString()} />
      </div>

      <div className={canReadFinance ? "grid gap-5 lg:grid-cols-[1.3fr_0.7fr]" : ""}>
        {canReadFinance ? <RevenueChart financeSummary={financeSummary} settings={settings} /> : null}
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
