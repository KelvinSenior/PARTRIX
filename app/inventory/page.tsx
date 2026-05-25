import { redirect } from "next/navigation";
import InventoryManager from "@/components/inventory/InventoryManager";
import { getAuthCookie } from "@/lib/cookies";
import { getCurrentUserFromToken } from "@/services/auth";

export default async function InventoryPage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-black dark:text-zinc-100">
      <InventoryManager user={user} />
    </main>
  );
}

