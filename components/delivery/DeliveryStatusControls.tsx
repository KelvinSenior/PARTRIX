"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DeliveryDTO, DeliveryStatus } from "@/types/delivery";
import { Truck, CheckCircle2, Clock, XCircle, MapPin, RefreshCcw } from "lucide-react";

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  SCHEDULED: {
    label: "Scheduled",
    color: "text-cyan-200",
    bg: "bg-cyan-400/15 border-cyan-400/25",
    icon: Clock,
  },
  IN_TRANSIT: {
    label: "In Transit",
    color: "text-amber-200",
    bg: "bg-amber-400/15 border-amber-400/25",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-emerald-200",
    bg: "bg-emerald-400/15 border-emerald-400/25",
    icon: MapPin,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-emerald-200",
    bg: "bg-emerald-400/15 border-emerald-400/25",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-rose-200",
    bg: "bg-rose-400/15 border-rose-400/25",
    icon: XCircle,
  },
};

const NEXT_STEPS: Record<DeliveryStatus, { label: string; target: DeliveryStatus; style: string }[]> = {
  SCHEDULED: [
    {
      label: "Mark in transit",
      target: "IN_TRANSIT",
      style: "bg-amber-500 hover:bg-amber-600 text-white",
    },
  ],
  IN_TRANSIT: [
    {
      label: "Mark delivered",
      target: "DELIVERED",
      style: "bg-emerald-500 hover:bg-emerald-600 text-white",
    },
  ],
  DELIVERED: [
    {
      label: "Mark completed (items returned)",
      target: "COMPLETED",
      style: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
  ],
  COMPLETED: [],
  CANCELLED: [],
};

export default function DeliveryStatusControls({ delivery }: { delivery: DeliveryDTO }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = STATUS_CONFIG[delivery.status];
  const Icon = config.icon;
  const nextSteps = NEXT_STEPS[delivery.status] ?? [];
  const isFinal = ["COMPLETED", "CANCELLED"].includes(delivery.status);

  async function transitionTo(status: DeliveryStatus) {
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/deliveries/${delivery.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data?.message ?? "Failed to update delivery.");
      return;
    }
    router.refresh();
  }

  async function handleCancel() {
    if (!confirm("Cancel this delivery?")) return;
    await transitionTo("CANCELLED");
  }

  return (
    <div className="space-y-4">
      {/* Current status badge */}
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold ${config.bg} ${config.color}`}
      >
        <Icon className="h-4 w-4" aria-hidden />
        {config.label}
      </span>

      {/* Next steps */}
      {nextSteps.length > 0 && (
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
      )}

      {!isFinal && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-60"
        >
          <XCircle className="h-4 w-4" aria-hidden />
          Cancel delivery
        </button>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}
    </div>
  );
}
