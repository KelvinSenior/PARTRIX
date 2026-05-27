import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import DeliveryCard from "@/components/delivery/DeliveryCard";
import { listDeliveries } from "@/services/delivery";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import { redirect } from "next/navigation";
import { appBtnPrimary } from "@/lib/appStyles";
import { Plus } from "lucide-react";

export default async function DeliveriesPage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");
  if (!user) redirect("/login");
  const deliveries = await listDeliveries();

  return (
    <AppShell user={user} fabHref="/deliveries/add" fabLabel="New delivery">
      <PageHeader
        eyebrow="Dispatch"
        title="Deliveries"
        description="Schedule and track pickups, drop-offs, and field operations."
        actions={
          <Link href="/deliveries/add" className={appBtnPrimary}>
            <Plus className="h-4 w-4" aria-hidden />
            New delivery
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {deliveries.map((d) => (
          <DeliveryCard key={d.id} delivery={d} />
        ))}
      </div>
    </AppShell>
  );
}
