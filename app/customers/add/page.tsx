"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import CustomerForm from "@/components/customers/CustomerForm";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";

export default function AddCustomerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: any) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "Failed to create customer");
      }

      const result = await res.json();
      toastSuccess("Customer created successfully.");
      router.push(`/customers/${result.customer.id}`);
    } catch (err) {
      toastError((err as Error).message ?? "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) return <div>Loading...</div>;

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-[1800px] gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <Sidebar />

        <section className="space-y-6">
          <TopNav user={user} />

          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl font-semibold">Add Customer</h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Create a new customer record</p>
            </div>

            <div className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/90">
              <CustomerForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
