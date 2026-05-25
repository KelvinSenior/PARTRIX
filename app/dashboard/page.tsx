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

export default async function DashboardPage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-[1800px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <Sidebar />

        <section className="space-y-6">
          <TopNav user={user} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <StatsCard icon="💼" label="Active bookings" value="24" change="+12%" />
                <StatsCard icon="💰" label="Revenue" value="$128.4k" change="+14.5%" highlight />
                <StatsCard icon="📦" label="Inventory alerts" value="8" change="-6%" />
                <StatsCard icon="🚚" label="Pending deliveries" value="6" change="+8%" />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                <RevenueChart />
                <QuickActions />
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <BookingChart />
                <InventoryAlerts />
              </div>
            </div>

            <div className="space-y-6">
              <RecentBookings />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
