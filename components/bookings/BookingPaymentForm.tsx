"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { appBtnPrimary, appInput } from "@/lib/appStyles";

const paymentMethods = [
  { label: "Cash", value: "CASH" },
  { label: "Credit card", value: "CREDIT_CARD" },
  { label: "Bank transfer", value: "BANK_TRANSFER" },
  { label: "Check", value: "CHECK" },
  { label: "Mobile wallet", value: "MOBILE_WALLET" },
];

const paymentTypes = [
  { label: "Rental payment", value: "RENTAL" },
  { label: "Deposit payment", value: "SECURITY_DEPOSIT" },
  { label: "Refund", value: "REFUND" },
];

export default function BookingPaymentForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("CASH");
  const [type, setType] = useState("RENTAL");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount,
          method,
          type,
          transactionReference: reference || undefined,
          notes: notes || undefined,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.message || "Failed to record payment.");
      }

      setMessage("Payment recorded successfully.");
      setAmount(0);
      setReference("");
      setNotes("");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Could not record payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-white">Record payment</h3>
        <p className="mt-1 text-sm text-zinc-400">Log a payment, deposit, or refund for this booking.</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount"
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            className={appInput}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={appInput}
          >
            {paymentTypes.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={appInput}
          >
            {paymentMethods.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Reference (optional)"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className={appInput}
          />
        </div>

        <div>
          <textarea
            rows={3}
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${appInput} min-h-[104px] resize-none`}
          />
        </div>

        {message ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || amount <= 0}
          className={`${appBtnPrimary} w-full ${loading || amount <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Recording..." : "Record payment"}
        </button>
      </form>
    </section>
  );
}
