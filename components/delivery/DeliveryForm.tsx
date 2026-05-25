"use client";

import { useState } from "react";

export default function DeliveryForm({ initial, onSubmit }: { initial?: any; onSubmit: (d: any) => void }) {
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
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm">Pickup</label>
        <input required value={pickup} onChange={(e) => setPickup(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Pickup address" />
      </div>
      <div>
        <label className="block text-sm">Dropoff</label>
        <input required value={dropoff} onChange={(e) => setDropoff(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Dropoff address" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="datetime-local" value={scheduledAt ?? ""} onChange={(e) => setScheduledAt(e.target.value)} className="rounded-md border px-3 py-2" />
        <input value={packageDetails} onChange={(e) => setPackageDetails(e.target.value)} className="rounded-md border px-3 py-2" placeholder="Package details" />
      </div>
      <button disabled={loading} className="rounded-md bg-sky-600 px-4 py-2 text-white">{loading ? 'Saving...' : 'Save'}</button>
    </form>
  );
}
