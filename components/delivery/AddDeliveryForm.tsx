"use client";

import { useRouter } from "next/navigation";
import DeliveryForm from "@/components/delivery/DeliveryForm";
import { appCard } from "@/lib/appStyles";

export default function AddDeliveryForm() {
  const router = useRouter();

  async function handleSubmit(data: {
    bookingId: string;
    customerId: string;
    address: string;
    scheduledAt: string;
    driver?: string;
    vehicle?: string;
    instructions?: string;
  }) {
    const res = await fetch("/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.message ?? "Failed to create delivery.");
    }

    const json = await res.json();
    router.push(`/deliveries/${json.delivery.id}`);
  }

  return (
    <div className={`max-w-2xl ${appCard}`}>
      <h2 className="text-lg font-semibold text-white">New delivery</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Link this delivery to an active booking. Driver and vehicle details will be visible to your team.
      </p>
      <div className="mt-5">
        <DeliveryForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
