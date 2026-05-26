import { redirect } from "next/navigation";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
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

export default async function DashboardPage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");

  if (!user) {
    redirect("/login");
  }

  // Fetch real data
  const [bookingsResult, deliveriesResult, financeSummary, inventoryResult] = await Promise.all([
    listBookings(),
    listDeliveries(),
    getFinanceSummary(),
    listInventoryItems({ search: "", category: "", status: "all", availability: "all", sort: "name" }),
  ]);

  const activeBookings = bookingsResult.bookings.filter(b => ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status)).length;
  const totalRevenue = financeSummary.totals.revenue;
  const inventoryAlerts = inventoryResult.items.filter(item => item.availableQuantity <= item.minimumThreshold).length;
  const pendingDeliveries = deliveriesResult.filter((d: any) => ["SCHEDULED", "IN_TRANSIT"].includes(d.status)).length;

  // Calculate percentage changes (simplified - using static comparisons)
  const bookingChange = activeBookings > 0 ? "+12%" : "0%";
  const revenueChange = totalRevenue > 50000 ? "+14.5%" : "+8.2%";
  const alertChange = inventoryAlerts > 5 ? "-6%" : "+2%";
  const deliveryChange = pendingDeliveries > 3 ? "+8%" : "+3%";

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-[1800px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <Sidebar />

        <section className="space-y-6">
          <TopNav user={user} />

          <div className="grid gap-6">
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard icon="💼" label="Active bookings" value={activeBookings.toString()} change={bookingChange} />
                <StatsCard icon="💰" label="Revenue" value={`$${(totalRevenue / 1000).toFixed(1)}k`} change={revenueChange} highlight />
                <StatsCard icon="📦" label="Inventory alerts" value={inventoryAlerts.toString()} change={alertChange} />
                <StatsCard icon="🚚" label="Pending deliveries" value={pendingDeliveries.toString()} change={deliveryChange} />
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                <RevenueChart financeSummary={financeSummary} />
                <QuickActions />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <BookingChart bookings={bookingsResult.bookings} />
                <InventoryAlerts items={inventoryResult.items} />
              </div>

              <RecentBookings bookings={bookingsResult.bookings} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
