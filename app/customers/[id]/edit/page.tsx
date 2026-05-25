"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import CustomerForm from "@/components/customers/CustomerForm";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customerId, setCustomerId] = useState<string>("");

  useEffect(() => {
    const { id } = params;
    setCustomerId(id);
    fetch(`/api/customers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const { customer } = data;
        setInitialData({
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || "",
          company: customer.company || "",
          address: customer.address || "",
          notes: customer.notes || "",
        });
      });
  }, [params]);

  async function handleSubmit(data: any) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "Failed to update customer");
      }

      toastSuccess("Customer updated successfully.");
      router.push(`/customers/${customerId}`);
    } catch (err) {
      toastError((err as Error).message ?? "Failed to update customer");
    } finally {
      setIsLoading(false);
    }
  }

  if (!user || !initialData) return <div>Loading...</div>;

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-[1800px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <Sidebar />

        <section className="space-y-6">
          <TopNav user={user} />

          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl font-semibold">Edit Customer</h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Update customer information</p>
            </div>

            <div className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/90">
              <CustomerForm initialData={initialData} onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
