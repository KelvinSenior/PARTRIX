import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import AddCustomerForm from "@/components/customers/AddCustomerForm";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";

export default async function AddCustomerPage() {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");
  if (!user) redirect("/login");

  return (
    <AppShell user={user} showFab={false}>
      <PageHeader
        eyebrow="Customers"
        title="Add customer"
        description="Create a new customer record for bookings and finance."
      />
      <AddCustomerForm />
    </AppShell>
  );
}
