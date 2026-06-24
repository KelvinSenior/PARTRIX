"use client";

import { useEffect, useState } from "react";
import { appInput, appBtnPrimary } from "@/lib/appStyles";

interface BookingOption {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  address: string;
}

interface FormData {
  bookingId: string;
  customerId: string;
  address: string;
  scheduledAt: string;
  driver?: string;
  vehicle?: string;
  instructions?: string;
}

export default function DeliveryForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<FormData>;
  onSubmit: (data: FormData) => Promise<void>;
}) {
  const [bookings, setBookings] = useState<BookingOption[]>([]);
  const [form, setForm] = useState<FormData>({
    bookingId: initial?.bookingId ?? "",
    customerId: initial?.customerId ?? "",
    address: initial?.address ?? "",
    scheduledAt: initial?.scheduledAt ?? "",
    driver: initial?.driver ?? "",
    vehicle: initial?.vehicle ?? "",
    instructions: initial?.instructions ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.bookings ?? [])
          .filter((b: any) => ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status))
          .map((b: any) => ({
            id: b.id,
            bookingNumber: b.bookingNumber,
            customerId: b.customer.id,
            customerName: `${b.customer.firstName} ${b.customer.lastName}`,
            address: b.customer.address ?? "",
          }));
        setBookings(list);
      })
      .catch(() => setBookings([]));
  }, []);

  function handleBookingChange(bookingId: string) {
    const found = bookings.find((b) => b.id === bookingId);
    setForm((prev) => ({
      ...prev,
      bookingId,
      customerId: found?.customerId ?? "",
      address: found?.address ?? prev.address,
    }));
  }

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.message ?? "Failed to save delivery.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Booking selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Linked booking <span className="text-rose-400">*</span>
        </label>
        <select
          required
          value={form.bookingId}
          onChange={(e) => handleBookingChange(e.target.value)}
          className={appInput}
        >
          <option value="">Select a booking…</option>
          {bookings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.bookingNumber} — {b.customerName}
            </option>
          ))}
        </select>
        {bookings.length === 0 && (
          <p className="mt-1.5 text-xs text-zinc-500">
            No active bookings found. Create a booking first.
          </p>
        )}
      </div>

      {/* Delivery address */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Delivery address <span className="text-rose-400">*</span>
        </label>
        <input
          required
          type="text"
          placeholder="Delivery address"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          className={appInput}
        />
      </div>

      {/* Scheduled at */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Scheduled date &amp; time <span className="text-rose-400">*</span>
        </label>
        <input
          required
          type="datetime-local"
          value={form.scheduledAt}
          onChange={(e) => set("scheduledAt", e.target.value)}
          className={appInput}
        />
      </div>

      {/* Driver + Vehicle */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">Driver name</label>
          <input
            type="text"
            placeholder="Driver name"
            value={form.driver}
            onChange={(e) => set("driver", e.target.value)}
            className={appInput}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">Vehicle</label>
          <input
            type="text"
            placeholder="Vehicle plate / description"
            value={form.vehicle}
            onChange={(e) => set("vehicle", e.target.value)}
            className={appInput}
          />
        </div>
      </div>

      {/* Instructions */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">Instructions</label>
        <textarea
          placeholder="Delivery instructions, access codes, contact notes…"
          value={form.instructions}
          onChange={(e) => set("instructions", e.target.value)}
          rows={3}
          className={`${appInput} h-auto resize-none py-3`}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className={`${appBtnPrimary} w-full`}>
        {loading ? "Saving…" : "Schedule delivery"}
      </button>
    </form>
  );
}
