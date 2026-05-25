import { redirect } from "next/navigation";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import CustomerSearch from "@/components/customers/CustomerSearch";
import CustomerList from "@/components/customers/CustomerList";
import { listCustomers } from "@/services/customer";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string; sortBy?: string; order?: string };
}) {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");
  if (!user) redirect("/login");

  const page = Math.max(1, Number(searchParams?.page ?? "1"));
  const limit = 12;
  const offset = (page - 1) * limit;

  const { customers, total } = await listCustomers({
    query: searchParams?.q,
    sortBy: (searchParams?.sortBy as any) ?? "createdAt",
    order: (searchParams?.order as any) ?? "desc",
    limit,
    offset,
  });

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-[1800px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <Sidebar />

        <section className="space-y-6">
          <TopNav user={user} />

          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Customers</h1>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Browse and manage your customer records.</p>
              </div>
              <a href="/customers/add" className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400">
                + Add Customer
              </a>
            </div>

            <CustomerSearch />

            <CustomerList
              customers={customers}
              total={total}
              currentPage={page}
              query={searchParams?.q}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
