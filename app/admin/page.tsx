import { redirect } from "next/navigation";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";

export default async function AdminPage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-950 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-12 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold">Admin area</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          This page is restricted to administrators. Role-based permissions are enforced both in middleware and server-side route checks.
        </p>
      </div>
    </main>
  );
}
