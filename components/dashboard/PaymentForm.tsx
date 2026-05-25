"use client";

import { useState } from "react";

export default function PaymentForm({ bookingId }: { bookingId?: string | null }) {
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount, method, notes }),
      });
      if (!res.ok) throw new Error('Failed');
      // simple refresh
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Could not record payment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2">
        <input type="number" step="0.01" aria-label="Amount" className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400" value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Amount" />
        <select aria-label="Payment method" value={method} onChange={(e) => setMethod(e.target.value)} className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50">
          <option value="CASH">Cash</option>
          <option value="CREDIT_CARD">Card</option>
          <option value="BANK_TRANSFER">Bank</option>
          <option value="CHECK">Check</option>
          <option value="MOBILE_WALLET">Mobile</option>
        </select>
      </div>
      <div>
        <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div>
        <button disabled={loading} className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-600">{loading ? 'Saving...' : 'Record Payment'}</button>
      </div>
    </form>
  );
}
