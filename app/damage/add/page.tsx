import Sidebar from '@/components/dashboard/Sidebar';
import TopNav from '@/components/dashboard/TopNav';
import DamageForm from '@/components/damage/DamageForm';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getCurrentUserFromToken } from '@/services/auth';
import { getAuthCookie } from '@/lib/cookies';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? '');
  if (!user?.organizationId) redirect('/login');

  const items = await prisma.inventoryItem.findMany({ where: { organizationId: user.organizationId }, select: { id: true, name: true }, orderBy: { name: 'asc' } });

  return (
    <div className="mx-auto grid min-h-screen max-w-300 gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
      <Sidebar role={user.role} />
      <main>
        <TopNav user={user} />
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
