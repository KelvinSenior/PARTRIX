import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import AddDeliveryForm from "@/components/delivery/AddDeliveryForm";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";

export default async function AddDeliveryPage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");
  if (!user) redirect("/login");

  return (
    <AppShell user={user} showFab={false}>
      <PageHeader
        eyebrow="Dispatch"
        title="Schedule delivery"
        description="Add pickup, drop-off, and package details for the field team."
      />
      <AddDeliveryForm />
    </AppShell>
  );
}
