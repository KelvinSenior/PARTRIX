"use client";

import { useState } from "react";
import { appBtnPrimary } from "@/lib/appStyles";

export default function DeliveryForm({ initial, onSubmit }: { initial?: { pickupAddress?: string; dropoffAddress?: string; scheduledAt?: string; packageDetails?: string }; onSubmit: (d: { pickupAddress: string; dropoffAddress: string; scheduledAt?: string; packageDetails?: string }) => void }) {
  const [pickup, setPickup] = useState(initial?.pickupAddress ?? "");
  const [dropoff, setDropoff] = useState(initial?.dropoffAddress ?? "");
  const [scheduledAt, setScheduledAt] = useState(initial?.scheduledAt ?? "");
  const [packageDetails, setPackageDetails] = useState(initial?.packageDetails ?? "");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ pickupAddress: pickup, dropoffAddress: dropoff, scheduledAt, packageDetails });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">Pickup</label>
        <input required value={pickup} onChange={(e) => setPickup(e.target.value)} className="field-input" placeholder="Pickup address" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">Dropoff</label>
        <input required value={dropoff} onChange={(e) => setDropoff(e.target.value)} className="field-input" placeholder="Dropoff address" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input type="datetime-local" value={scheduledAt ?? ""} onChange={(e) => setScheduledAt(e.target.value)} className="field-input" />
        <input value={packageDetails} onChange={(e) => setPackageDetails(e.target.value)} className="field-input" placeholder="Package details" />
      </div>
      <button type="submit" disabled={loading} className={`${appBtnPrimary} w-full`}>
        {loading ? "Saving..." : "Save delivery"}
      </button>
    </form>
  );
}
