"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingDTO } from "@/types/booking";
import { appCard } from "@/lib/appStyles";
import { CheckCircle2, Clock, PlayCircle, XCircle, AlertCircle, RefreshCcw } from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-700 dark:text-amber-200",
    bg: "border border-amber-300/70 bg-amber-50 dark:border-amber-400/25 dark:bg-amber-400/15",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-emerald-700 dark:text-emerald-200",
    bg: "border border-emerald-300/70 bg-emerald-50 dark:border-emerald-400/25 dark:bg-emerald-400/15",
    icon: CheckCircle2,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-cyan-700 dark:text-cyan-200",
    bg: "border border-cyan-300/70 bg-cyan-50 dark:border-cyan-400/25 dark:bg-cyan-400/15",
    icon: PlayCircle,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-emerald-700 dark:text-emerald-200",
    bg: "border border-emerald-300/70 bg-emerald-50 dark:border-emerald-400/25 dark:bg-emerald-400/15",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-rose-700 dark:text-rose-200",
    bg: "border border-rose-300/70 bg-rose-50 dark:border-rose-400/25 dark:bg-rose-400/15",
    icon: XCircle,
  },
  NO_SHOW: {
    label: "No Show",
    color: "text-slate-700 dark:text-zinc-300",
    bg: "border border-slate-300/70 bg-slate-100 dark:border-zinc-500/25 dark:bg-zinc-500/20",
    icon: AlertCircle,
  },
};

const STATUS_FLOW: Record<string, { label: string; target: string; style: string }[]> = {
  PENDING: [
    {
      label: "Confirm booking",
      target: "CONFIRMED",
      style:
        "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_16px_rgba(52,211,153,0.28)]",
    },
    { label: "Mark no-show", target: "NO_SHOW", style: "border border-zinc-600 bg-white/5 text-zinc-300 hover:bg-white/10" },
  ],
  CONFIRMED: [
    {
      label: "Start rental (In Progress)",
      target: "IN_PROGRESS",
      style:
        "bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_4px_16px_rgba(34,211,238,0.28)]",
    },
  ],
  IN_PROGRESS: [
    {
      label: "Complete rental (Items returned)",
      target: "COMPLETED",
      style:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_16px_rgba(16,185,129,0.28)]",
    },
  ],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export default function BookingStatusControls({
  booking,
}: {
  booking: BookingDTO;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING;
  const Icon = config.icon;
  const nextSteps = STATUS_FLOW[booking.status] ?? [];

  const isFinal = ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status);

  async function transitionTo(targetStatus: string) {
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateStatus", status: targetStatus }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data?.message ?? "Failed to update status.");
      return;
    }

    router.refresh();
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this booking? This will restore inventory.")) return;
    await transitionTo("CANCELLED");
  }

  return (
    <section className={`${appCard} space-y-5 border border-slate-200/80 dark:border-cyan-200/10`}>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-200/75">
            Booking status
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold ${config.bg} ${config.color}`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {config.label}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-200/70 pt-4 space-y-2 dark:border-zinc-800/60">
          <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500">
            Change Status Manually
          </label>
          <select
            value={booking.status}
            onChange={(e) => transitionTo(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
          >
            <option value="PENDING">Pending (Draft / Quote)</option>
            <option value="CONFIRMED">Confirmed (Items Reserved)</option>
            <option value="IN_PROGRESS">In Progress (Customer Received Items)</option>
            <option value="COMPLETED">Completed (Items Returned)</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>
      </div>

      {/* Status progression steps */}
      {nextSteps.length > 0 && (
        <div className="space-y-2 border-t border-slate-200/70 pt-4 dark:border-zinc-800/60">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500">
            Suggested Next Action
          </p>
          <div className="flex flex-wrap gap-2">
            {nextSteps.map((step) => (
              <button
                key={step.target}
                type="button"
                onClick={() => transitionTo(step.target)}
                disabled={loading}
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${step.style}`}
              >
                <RefreshCcw className="h-3.5 w-3.5" aria-hidden />
                {step.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cancel — always shown unless already final */}
      {!isFinal && (
        <div className="border-t border-slate-200/70 pt-4 dark:border-zinc-800/60">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-300/70 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
          >
            <XCircle className="h-4 w-4" />
            Cancel booking
          </button>
        </div>
      )}

      {loading && (
        <p className="text-xs text-slate-500 dark:text-zinc-500">Updating status…</p>
      )}

      {error && (
        <div className="rounded-xl border border-rose-300/70 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}
    </section>
  );
}
