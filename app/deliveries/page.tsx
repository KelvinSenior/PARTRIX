import Sidebar from '@/components/dashboard/Sidebar';
import TopNav from '@/components/dashboard/TopNav';
import DeliveryCard from '@/components/delivery/DeliveryCard';
import { listDeliveries } from '@/services/delivery';
import { getCurrentUserFromToken } from '@/services/auth';
import { getAuthCookie } from '@/lib/cookies';
import { redirect } from 'next/navigation';

export default async function DeliveriesPage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? '');
  if (!user) redirect('/login');
  const deliveries = await listDeliveries();

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-[1200px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <Sidebar />
        <section className="space-y-6">
          <TopNav user={user} />
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Deliveries</h1>
            <a href="/deliveries/add" className="rounded-md bg-sky-600 px-4 py-2 text-white">+ New Delivery</a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {deliveries.map((d: any) => (
              <DeliveryCard key={d.id} delivery={d} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
