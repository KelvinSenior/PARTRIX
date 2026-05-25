"use client";
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import TopNav from '@/components/dashboard/TopNav';
import DeliveryForm from '@/components/delivery/DeliveryForm';
import { useAuth } from '@/hooks/useAuth';

export default function AddDeliveryPage() {
  const router = useRouter();
  const { user } = useAuth();

  async function handleSubmit(data: any) {
    const res = await fetch('/api/deliveries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed');
    const json = await res.json();
    router.push(`/deliveries/${json.delivery.id}`);
  }

  if (!user) return <div>Loading...</div>;

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-[1200px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <Sidebar />
        <section className="space-y-6">
          <TopNav user={user} />
          <div className="max-w-2xl rounded-xl bg-white p-6">
            <h2 className="text-lg font-semibold">New Delivery</h2>
            <div className="mt-4">
              <DeliveryForm onSubmit={handleSubmit} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
