"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import CustomerForm from "@/components/customers/CustomerForm";
import { toastError, toastSuccess } from "@/components/ui/Toast";
import { appCard } from "@/lib/appStyles";

export default function AddCustomerForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(data: Record<string, unknown>) {
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

  return (
    <div className={`max-w-2xl ${appCard}`}>
      <CustomerForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
