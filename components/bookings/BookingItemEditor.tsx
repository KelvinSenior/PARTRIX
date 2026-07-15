"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PencilLine, Save } from "lucide-react";
import type { BookingDTO } from "@/types/booking";
import PremiumButton from "@/components/ui/PremiumButton";
import { appCard, appCardInner, appEyebrow } from "@/lib/appStyles";

type DraftItem = {
  quantity: number;
  discount: number;
  notes: string;
};

export default function BookingItemEditor({ booking }: { booking: BookingDTO }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, DraftItem>>(() => Object.fromEntries(
    booking.bookingItems.map((item) => [
      item.id,
      {
        quantity: item.quantity,
        discount: item.discount,
        notes: item.notes ?? "",
      },
    ]),
  ));
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canEdit = !["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status);

  const itemSummary = useMemo(() => booking.bookingItems.reduce((sum, item) => sum + item.totalPrice, 0), [booking.bookingItems]);

  function updateDraft(id: string, patch: Partial<DraftItem>) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...patch,
      },
    }));
  }

  async function saveItem(itemId: string) {
    const draft = drafts[itemId];
    if (!draft) {
      return;
    }

    setSavingId(itemId);
    setError(null);
    setSuccess(null);

    const response = await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateItems",
        items: [
          {
            bookingItemId: itemId,
            quantity: Math.max(1, Number(draft.quantity) || 1),
            discount: Number(draft.discount) || 0,
            notes: draft.notes.trim() || null,
          },
        ],
      }),
    });

    const result = await response.json().catch(() => ({ message: "Unable to update this booking item." }));
    setSavingId(null);

    if (!response.ok) {
      setError(result?.message ?? "Unable to update this booking item.");
      return;
    }

    setSuccess("Booking item updated successfully.");
    router.refresh();
  }

  return (
    <section className={appCard}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={appEyebrow}>Rented items</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Adjust item quantities and pricing</h2>
        </div>
        <div className={`rounded-full border px-3 py-1 text-sm font-semibold ${canEdit ? "border-emerald-300/80 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200" : "border-slate-300/80 bg-slate-100 text-slate-700 dark:border-zinc-500/25 dark:bg-zinc-500/20 dark:text-zinc-300"}`}>
          {canEdit ? "Editable while pending" : "Locked once confirmed"}
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-600 dark:text-zinc-400">
        {canEdit
          ? "Update the quantity, discount, or notes for each rented item before the booking is confirmed."
          : "Once the booking is confirmed, these values stay locked to protect the reservation record."}
      </div>

      {error ? <div className="mt-4 rounded-2xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-400/25 dark:bg-rose-400/10 dark:text-rose-200">{error}</div> : null}
      {success ? <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-200">{success}</div> : null}

      <div className="mt-5 space-y-3">
        {booking.bookingItems.map((item) => {
          const draft = drafts[item.id];
          return (
            <div key={item.id} className={`${appCardInner} space-y-3`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{item.inventoryItemName}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-zinc-500">
                    Line total GHC{item.totalPrice.toFixed(2)} · Unit price GHC{item.unitPrice.toFixed(2)}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/70 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
                  <PencilLine className="h-3.5 w-3.5" />
                  {canEdit ? "Edit" : "Locked"}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                  Quantity
                  <input
                    type="number"
                    min="1"
                    value={draft.quantity}
                    onChange={(event) => updateDraft(item.id, { quantity: Number(event.target.value) || 1 })}
                    disabled={!canEdit}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                  Discount
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.discount}
                    onChange={(event) => updateDraft(item.id, { discount: Number(event.target.value) || 0 })}
                    disabled={!canEdit}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
                  Notes
                  <input
                    value={draft.notes}
                    onChange={(event) => updateDraft(item.id, { notes: event.target.value })}
                    disabled={!canEdit}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <p className="text-sm text-slate-600 dark:text-zinc-400">Subtotal impact: GHC{(draft.quantity * item.unitPrice - draft.discount).toFixed(2)}</p>
                <PremiumButton type="button" variant="primary" size="md" onClick={() => saveItem(item.id)} isLoading={savingId === item.id} disabled={!canEdit}>
                  <Save className="h-4 w-4" /> Save
                </PremiumButton>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-slate-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Total of editable items: <span className="font-semibold text-slate-900 dark:text-white">GHC{itemSummary.toFixed(2)}</span>
      </div>
    </section>
  );
}
