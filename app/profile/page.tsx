import { redirect } from "next/navigation";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";

export default async function ProfilePage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-950 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white p-10 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold">Profile</h1>
        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <dt className="text-sm uppercase tracking-[0.3em] text-zinc-500">Name</dt>
            <dd className="mt-3 text-lg font-semibold">{user.name ?? "–"}</dd>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <dt className="text-sm uppercase tracking-[0.3em] text-zinc-500">Email</dt>
            <dd className="mt-3 text-lg font-semibold break-all">{user.email}</dd>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:col-span-2">
            <dt className="text-sm uppercase tracking-[0.3em] text-zinc-500">Role</dt>
            <dd className="mt-3 text-lg font-semibold">{user.role}</dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
