import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { getDelivery } from "@/services/delivery";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import { appCard, appCardInner } from "@/lib/appStyles";

export default async function DeliveryDetails({ params }: { params: { id: string } }) {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");
  if (!user) redirect("/login");
  const d = await getDelivery(params.id);
  if (!d) redirect("/deliveries");

  return (
    <AppShell user={user} showFab={false}>
      <PageHeader
        eyebrow="Delivery"
        title={`Delivery ${d.id.slice(0, 8)}`}
        description={`${d.pickupAddress} → ${d.dropoffAddress}`}
      />

      <div className={appCard}>
        <p className="text-sm text-zinc-400">
          Status: <span className="font-semibold text-cyan-100">{d.status}</span>
        </p>
        <div className={`${appCardInner} mt-4`}>
          <h4 className="font-semibold text-white">Notes</h4>
          <ul className="ml-5 mt-2 list-disc space-y-1 text-sm text-zinc-300">
            {d.notes.length === 0 ? (
              <li className="text-zinc-500">No notes</li>
            ) : (
              d.notes.map((n: string, i: number) => <li key={i}>{n}</li>)
            )}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
