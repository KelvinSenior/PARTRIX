"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingDTO } from "@/types/booking";
import { appCard, appCardInner, appBtnPrimary, appInput, appEyebrow } from "@/lib/appStyles";
import { RefreshCcw } from "lucide-react";

export default function BookingReturnForm({ booking }: { booking: BookingDTO }) {
  const router = useRouter();
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>(
    booking.bookingItems.reduce((acc, item) => {
      acc[item.id] = 0;
      return acc;
    }, {} as Record<string, number>),
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const returnItems = useMemo(
    () =>
      booking.bookingItems
        .map((item) => ({
          bookingItemId: item.id,
          quantity: returnQuantities[item.id] ?? 0,
          available: item.quantity - item.returnedQuantity,
        }))
        .filter((entry) => entry.quantity > 0),
    [booking.bookingItems, returnQuantities],
  );

  const canReturn = returnItems.length > 0;

  function updateQuantity(bookingItemId: string, value: number) {
    setReturnQuantities((current) => ({
      ...current,
      [bookingItemId]: Math.max(0, value),
    }));
  }

  async function handleReturn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "return", returnItems }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message ?? "Unable to process return.");
      }

      setMessage("Return processed successfully.");
      setReturnQuantities(
        booking.bookingItems.reduce((acc, item) => {
          acc[item.id] = 0;
          return acc;
        }, {} as Record<string, number>),
      );
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Failed to process return.");
    } finally {
      setLoading(false);
    }
  }

  const allReturned = booking.bookingItems.every(i => i.returnedQuantity >= i.quantity);

  return (
    <section className={`${appCard} border border-slate-200/80 dark:border-cyan-200/10`}>
      <div className="mb-6">
        <p className={appEyebrow}>Returns Management</p>
        <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Return items for this booking</h3>
      </div>

      <form onSubmit={handleReturn} className="space-y-4">
        {booking.bookingItems.map((item) => {
          const availableToReturn = item.quantity - item.returnedQuantity;
          if (availableToReturn <= 0) return null;

          return (
            <div key={item.id} className={`${appCardInner} space-y-3`}>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{item.inventoryItemName}</p>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-zinc-400">
                  Booked: <span className="font-medium text-slate-800 dark:text-zinc-200">{item.quantity}</span> &middot; Returned: <span className="font-medium text-slate-800 dark:text-zinc-200">{item.returnedQuantity}</span>
                </p>
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                    Return quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={availableToReturn}
                    value={returnQuantities[item.id] ?? 0}
                    onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                    className={`${appInput} py-1.5 px-3 text-sm`}
                  />
                </div>
                <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-100/80 p-3 text-xs text-slate-600 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-400">
                  <span>Available to return</span>
                  <span className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{availableToReturn}</span>
                </div>
              </div>
            </div>
          );
        })}

        {message && (
          <div className="rounded-xl border border-emerald-300/70 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-300/70 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        {allReturned ? (
          <p className="py-2 text-center text-sm font-medium text-emerald-700 dark:text-emerald-400">
            All items have been fully returned.
          </p>
        ) : (
          <button
            type="submit"
            disabled={!canReturn || loading}
            className={`${appBtnPrimary} w-full gap-2`}
          >
            <RefreshCcw className="h-4 w-4" />
            {loading ? "Processing return..." : "Process return"}
          </button>
        )}
      </form>
    </section>
  );
}

