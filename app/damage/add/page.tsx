import Sidebar from '@/components/dashboard/Sidebar';
import TopNav from '@/components/dashboard/TopNav';
import DamageForm from '@/components/damage/DamageForm';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const items = await prisma.inventoryItem.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });

  return (
    <div className="mx-auto grid min-h-screen max-w-300 gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
      <Sidebar />
      <main>
        <TopNav user={null as any} />
        <div className="mt-6">
          <h1 className="text-2xl font-semibold">Report Damage</h1>
          <div className="mt-4 max-w-xl">
            <DamageForm inventoryItems={items} />
          </div>
        </div>
      </main>
    </div>
  );
}
