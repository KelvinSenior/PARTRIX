import { redirect } from "next/navigation";
import InventoryManager from "@/components/inventory/InventoryManager";
import AppShell from "@/components/layout/AppShell";
import { getAuthCookie } from "@/lib/cookies";
import { getCurrentUserFromToken } from "@/services/auth";

export default async function InventoryPage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell user={user} fabHref="/inventory" fabLabel="Add item">
      <InventoryManager user={user} />
    </AppShell>
  );
}
