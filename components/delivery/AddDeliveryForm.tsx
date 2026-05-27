"use client";

import { useRouter } from "next/navigation";
import DeliveryForm from "@/components/delivery/DeliveryForm";
import { appCard } from "@/lib/appStyles";

export default function AddDeliveryForm() {
  const router = useRouter();

  async function handleSubmit(data: {
    pickupAddress: string;
    dropoffAddress: string;
    scheduledAt?: string;
    packageDetails?: string;
  }) {
    const res = await fetch("/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed");
    const json = await res.json();
    router.push(`/deliveries/${json.delivery.id}`);
  }

  return (
    <div className={`max-w-2xl ${appCard}`}>
      <h2 className="text-lg font-semibold text-white">New delivery</h2>
      <div className="mt-4">
        <DeliveryForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
