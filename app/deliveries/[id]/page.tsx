import Sidebar from '@/components/dashboard/Sidebar';
import TopNav from '@/components/dashboard/TopNav';
import { getDelivery } from '@/services/delivery';
import { getCurrentUserFromToken } from '@/services/auth';
import { getAuthCookie } from '@/lib/cookies';
import { redirect } from 'next/navigation';

export default async function DeliveryDetails({ params }: { params: { id: string } }) {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? '');
  if (!user) redirect('/login');
  const d = await getDelivery(params.id);
  if (!d) redirect('/deliveries');

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-[1200px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <Sidebar />
        <section className="space-y-6">
          <TopNav user={user} />
          <div className="rounded-xl bg-white p-6">
            <h2 className="text-xl font-semibold">Delivery {d.id}</h2>
            <p className="mt-2 text-sm text-zinc-700">{d.pickupAddress} → {d.dropoffAddress}</p>
            <p className="mt-2">Status: <strong>{d.status}</strong></p>
            <div className="mt-4">
              <h4 className="font-semibold">Notes</h4>
              <ul className="list-disc ml-6 mt-2 text-sm">
                {d.notes.length === 0 ? <li className="text-zinc-500">No notes</li> : d.notes.map((n: string, i: number) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
