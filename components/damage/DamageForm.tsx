"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DamageForm({ inventoryItems }: { inventoryItems: { id: string; name: string }[] }) {
  const router = useRouter();
  const [inventoryItemId, setInventoryItemId] = useState(inventoryItems[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [severity, setSeverity] = useState("MINOR");
  const [notes, setNotes] = useState("");
  const [missing, setMissing] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { inventoryItemId, quantity: Number(quantity), severity, notes, missing };
    const res = await fetch('/api/damage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) router.push('/damage');
    else alert('Error creating damage report');
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm">Item</span>
        <select value={inventoryItemId} onChange={(e) => setInventoryItemId(e.target.value)} className="mt-1 block w-full rounded-md border">
          {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="text-sm">Quantity</span>
        <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="mt-1 block w-full rounded-md border" />
      </label>

      <label className="block">
        <span className="text-sm">Severity</span>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="mt-1 block w-full rounded-md border">
          <option value="MINOR">Minor</option>
          <option value="MODERATE">Moderate</option>
          <option value="SEVERE">Severe</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm">Notes</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 block w-full rounded-md border" />
      </label>

      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={missing} onChange={(e) => setMissing(e.target.checked)} />
        <span className="text-sm">Mark as missing/lost</span>
      </label>

      <div>
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-white">Report Damage</button>
      </div>
    </form>
  );
}
