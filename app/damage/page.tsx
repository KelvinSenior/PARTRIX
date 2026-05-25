import Sidebar from '@/components/dashboard/Sidebar';
import TopNav from '@/components/dashboard/TopNav';
import { listDamageReports } from '@/services/damage';
import DamageCard from '@/components/damage/DamageCard';
import { EmptyState } from '@/components/ui';

export default async function Page() {
  const items = await listDamageReports();

  return (
    <div className="mx-auto grid min-h-screen max-w-[1200px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
      <Sidebar />
      <main>
        <TopNav user={null as any} />
        <div className="mt-6 grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Damage Reports</h1>
            <a href="/damage/add" className="rounded-md bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700">
              New Report
            </a>
          </div>

          {items.length === 0 ? (
            <EmptyState
              title="No damage reports"
              description="Track damage incidents and keep inventory counts accurate."
              action={<a href="/damage/add" className="inline-flex rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">Add report</a>}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {items.map((item) => (
                <DamageCard key={item.id} d={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
