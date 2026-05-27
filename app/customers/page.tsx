import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import CustomerSearch from "@/components/customers/CustomerSearch";
import CustomerList from "@/components/customers/CustomerList";
import { listCustomers } from "@/services/customer";
import { appBtnPrimary } from "@/lib/appStyles";

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
    sortBy: (searchParams?.sortBy as "createdAt" | "firstName" | "lastName" | "email") ?? "createdAt",
    order: (searchParams?.order as "asc" | "desc") ?? "desc",
    limit,
    offset,
  });

  return (
    <AppShell user={user} fabHref="/customers/add" fabLabel="Add customer">
      <PageHeader
        eyebrow="Customers"
        title="Customer directory"
        description="Browse and manage your customer records."
        actions={
          <Link href="/customers/add" className={appBtnPrimary}>
            <Plus className="h-4 w-4" aria-hidden />
            Add customer
          </Link>
        }
      />

      <CustomerSearch />

      <CustomerList
        customers={customers}
        total={total}
        currentPage={page}
        query={searchParams?.q}
      />
    </AppShell>
  );
}
