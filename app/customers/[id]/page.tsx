import { redirect } from "next/navigation";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import StatsCard from "@/components/dashboard/StatsCard";
import { getCustomerDetail, getCustomerBookings, getCustomerAnalytics } from "@/services/customer";
import { getOrganizationSettings } from "@/services/settings";
import { formatAmount } from "@/lib/branding";
import { hasPermission } from "@/lib/rolePolicy";

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await Promise.resolve(params);
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");
  if (!user) redirect("/login");

  const customer = await getCustomerDetail(id);
  if (!customer) redirect("/customers");

  const canReadFinance = hasPermission(user.role, "finance:read");
  const bookings = await getCustomerBookings(id);
  const analytics = canReadFinance ? await getCustomerAnalytics(id) : null;
  const settings = await getOrganizationSettings();

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-450 gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <Sidebar role={user.role} />

        <section className="space-y-6">
          <TopNav user={user} />

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">
                  {customer.firstName} {customer.lastName}
                </h1>
                {customer.company && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{customer.company}</p>}
              </div>
              <a href={`/customers/${customer.id}/edit`} className="rounded-md bg-sky-600 px-4 py-2 text-white">
                Edit
              </a>
            </div>

            <div className={`grid gap-6 sm:grid-cols-2 ${canReadFinance ? "lg:grid-cols-4" : "lg:grid-cols-1"}`}>
              <StatsCard icon="package" label="Total Bookings" value={customer.bookingCount.toString()} />
              {analytics ? <>
                <StatsCard icon="dollarSign" label="Total Spent" value={formatAmount(analytics.totalRevenue, settings)} highlight />
                <StatsCard icon="wallet" label="Total Paid" value={formatAmount(analytics.totalPaid, settings)} />
                <StatsCard icon="receipt" label="Outstanding" value={formatAmount(analytics.totalOutstanding, settings)} />
              </> : null}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-4xl border border-zinc-200/80 bg-white/95 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/85">
                <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Contact Information</h3>
                <div className="mt-4 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                  {customer.email && (
                    <div>
                      <span className="text-zinc-600 dark:text-zinc-400">Email</span>
                      <p className="font-medium text-zinc-950 dark:text-zinc-50">{customer.email}</p>
                    </div>
                  )}
                  {customer.phone && (
                    <div>
                      <span className="text-zinc-600 dark:text-zinc-400">Phone</span>
                      <p className="font-medium text-zinc-950 dark:text-zinc-50">{customer.phone}</p>
                    </div>
                  )}
                  {customer.address && (
                    <div>
                      <span className="text-zinc-600 dark:text-zinc-400">Address</span>
                      <p className="font-medium text-zinc-950 dark:text-zinc-50">{customer.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {analytics ? <div className="rounded-4xl border border-zinc-200/80 bg-white/95 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/85">
                <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Analytics</h3>
                <div className="mt-4 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <div>
                    <span className="text-zinc-600 dark:text-zinc-400">Average Order Value</span>
                    <p className="font-semibold text-zinc-950 dark:text-zinc-50">{formatAmount(analytics.avgOrderValue, settings)}</p>
                  </div>
                  <div>
                    <span className="text-zinc-600 dark:text-zinc-400">Last Booking</span>
                    <p className="font-medium text-zinc-950 dark:text-zinc-50">{customer.lastBookingDate ? new Date(customer.lastBookingDate).toLocaleDateString() : "No bookings yet"}</p>
                  </div>
                </div>
              </div> : null}
            </div>

            <div className="rounded-4xl border border-zinc-200/80 bg-white/95 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/85">
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Booking History</h3>
              <div className="mt-4 overflow-x-auto">
                {bookings.length === 0 ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">No bookings yet</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                        <th className="pb-2 text-left">Booking #</th>
                        <th className="pb-2 text-left">Date</th>
                        <th className="pb-2 text-left">Items</th>
                        {canReadFinance ? <>
                          <th className="pb-2 text-left">Total</th>
                          <th className="pb-2 text-left">Balance</th>
                        </> : null}
                        <th className="pb-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-b border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                          <td className="py-3">
                            <a href={`/bookings/${b.id}`} className="text-sky-600 hover:underline dark:text-sky-400">
                              {b.bookingNumber}
                            </a>
                          </td>
                          <td className="py-3">{new Date(b.eventDate).toLocaleDateString()}</td>
                          <td className="py-3">{b.itemCount}</td>
                          {canReadFinance ? <>
                            <td className="py-3">{formatAmount(b.totalAmount ?? 0, settings)}</td>
                            <td className="py-3">{formatAmount(b.balanceDue ?? 0, settings)}</td>
                          </> : null}
                          <td className="py-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              b.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                : b.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300"
                                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
