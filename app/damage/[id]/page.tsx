import Sidebar from '@/components/dashboard/Sidebar';
import TopNav from '@/components/dashboard/TopNav';
import { getDamageReport } from '@/services/damage';

export default async function Page({ params }: { params: { id: string } }) {
  const d = await getDamageReport(params.id);
  if (!d) return <div>Not found</div>;

  return (
    <div className="mx-auto grid min-h-screen max-w-[1200px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
      <Sidebar />
      <main>
        <TopNav user={null as any} />
        <div className="mt-6">
          <h1 className="text-2xl font-semibold">Damage Report</h1>
          <div className="mt-4 rounded-lg border p-4">
            <p><strong>Item:</strong> {d.inventoryItemName}</p>
            <p><strong>Quantity:</strong> {d.quantity}</p>
            <p><strong>Severity:</strong> {d.severity}</p>
            <p><strong>Notes:</strong> {d.notes}</p>
            <p><strong>Resolved:</strong> {d.resolved ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
