"use client";

import { useState } from "react";

export default function ExpenseForm({ bookingId }: { bookingId?: string | null }) {
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('GENERAL');
  const [vendor, setVendor] = useState('');
  const [incurredAt, setIncurredAt] = useState(new Date().toISOString().slice(0,10));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount, category, vendor, incurredAt, notes }),
      });
      if (!res.ok) throw new Error('Failed');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Could not record expense');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2">
        <input type="number" step="0.01" className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400" value={amount} onChange={(e) => setAmount(Number(e.target.value))} placeholder="Amount" />
        <input className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Vendor" />
      </div>
      <div className="flex gap-2">
        <input type="date" aria-label="Expense date" className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50" value={incurredAt} onChange={(e) => setIncurredAt(e.target.value)} />
        <input aria-label="Expense category" className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
      </div>
      <div>
        <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div>
        <button disabled={loading} className="rounded-md bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 disabled:opacity-50 dark:bg-rose-700 dark:hover:bg-rose-600">{loading ? 'Saving...' : 'Record Expense'}</button>
      </div>
    </form>
  );
}
