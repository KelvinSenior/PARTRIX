import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { listDamageReports } from "@/services/damage";
import DamageCard from "@/components/damage/DamageCard";
import { EmptyState } from "@/components/ui";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import { appBtnPrimary } from "@/lib/appStyles";

export default async function DamagePage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");
  if (!user) redirect("/login");

  const items = await listDamageReports();

  return (
    <AppShell user={user} fabHref="/damage/add" fabLabel="New report">
      <PageHeader
        eyebrow="Operations"
        title="Damage reports"
        description="Track damage incidents and keep inventory counts accurate."
        actions={
          <Link href="/damage/add" className={appBtnPrimary}>
            <Plus className="h-4 w-4" aria-hidden />
            New report
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="No damage reports"
          description="Track damage incidents and keep inventory counts accurate."
          action={
            <Link href="/damage/add" className={appBtnPrimary}>
              Add report
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <DamageCard key={item.id} d={item} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
