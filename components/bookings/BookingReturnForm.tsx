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
    <section className={`${appCard} border border-zinc-800/80`}>
      <div className="mb-6">
        <p className={appEyebrow}>Returns Management</p>
        <h3 className="text-xl font-semibold text-white mt-1">Return items for this booking</h3>
      </div>

      <form onSubmit={handleReturn} className="space-y-4">
        {booking.bookingItems.map((item) => {
          const availableToReturn = item.quantity - item.returnedQuantity;
          if (availableToReturn <= 0) return null;

          return (
            <div key={item.id} className={`${appCardInner} border border-zinc-800/60 bg-zinc-900/50 p-4 rounded-xl space-y-3`}>
              <div>
                <p className="font-semibold text-white">{item.inventoryItemName}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Booked: <span className="text-zinc-200">{item.quantity}</span> &middot; Returned: <span className="text-zinc-200">{item.returnedQuantity}</span>
                </p>
              </div>
              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
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
                <div className="rounded-xl bg-zinc-950 p-3 text-xs text-zinc-400 border border-zinc-900 flex flex-col justify-between">
                  <span>Available to return</span>
                  <span className="text-lg font-bold text-white mt-1">{availableToReturn}</span>
                </div>
              </div>
            </div>
          );
        })}

        {message && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {allReturned ? (
          <p className="text-sm text-emerald-400 font-medium text-center py-2">
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

