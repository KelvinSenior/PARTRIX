"use client";

import { useMemo, useState } from "react";
import type { BookingDTO } from "@/types/booking";

export default function BookingReturnForm({ booking }: { booking: BookingDTO }) {
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

    const response = await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "return", returnItems }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result?.message ?? "Unable to process return.");
      return;
    }

    setMessage("Return processed successfully.");
  }

  async function handleCancel() {
    setError(null);
    setMessage(null);
    setLoading(true);

    const response = await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result?.message ?? "Unable to cancel booking.");
      return;
    }

    setMessage("Booking cancelled successfully.");
  }

  return (
    <section className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm shadow-zinc-200/30 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-zinc-950/15">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Partial returns</p>
          <h3 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Return items for this booking</h3>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading || booking.status === "CANCELLED" || booking.status === "COMPLETED"}
          className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel booking
        </button>
      </div>

      <form onSubmit={handleReturn} className="space-y-4">
        {booking.bookingItems.map((item) => {
          const availableToReturn = item.quantity - item.returnedQuantity;
          return (
            <div key={item.id} className="grid gap-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-[1fr_200px_200px]">
              <div>
                <p className="font-semibold text-zinc-950 dark:text-zinc-100">{item.inventoryItemName}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Booked {item.quantity} unit(s); returned {item.returnedQuantity}</p>
              </div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Return quantity
                <input
                  type="number"
                  min="0"
                  max={availableToReturn}
                  value={returnQuantities[item.id] ?? 0}
                  onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
              <div className="rounded-3xl bg-zinc-100 p-4 text-sm text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                <p>Available to return</p>
                <p className="mt-2 text-lg font-semibold">{availableToReturn}</p>
              </div>
            </div>
          );
        })}

        {message ? (
          <div className="rounded-3xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">{message}</div>
        ) : null}

        {error ? (
          <div className="rounded-3xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-100">{error}</div>
        ) : null}

        <button
          type="submit"
          disabled={!canReturn || loading}
          className="rounded-3xl bg-sky-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Processing return..." : "Process partial return"}
        </button>
      </form>
    </section>
  );
}
