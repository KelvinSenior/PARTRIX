"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { appInput, appBtnPrimary } from "@/lib/appStyles";
import { Check } from "lucide-react";

export default function DamageResolveForm({ damageReportId }: { damageReportId: string }) {
  const router = useRouter();
  const [action, setAction] = useState<"repair" | "mark_lost" | "none">("repair");
  const [customerCharge, setCustomerCharge] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const chargeVal = customerCharge ? parseFloat(customerCharge) : null;

    try {
      const res = await fetch(`/api/damage/${damageReportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          customerCharge: chargeVal,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.message ?? "Failed to resolve damage report.");
      }

      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Failed to resolve report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleResolve} className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Resolution Action
        </label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value as any)}
          className={appInput}
        >
          <option value="repair">Repair item (restores availability)</option>
          <option value="mark_lost">Mark as lost (reduces total count)</option>
          <option value="none">Close without stock change</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Customer Charge ($) <span className="text-zinc-500 font-normal">(optional)</span>
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={customerCharge}
          onChange={(e) => setCustomerCharge(e.target.value)}
          className={appInput}
        />
        <p className="mt-1.5 text-xs text-zinc-500">
          Records a charge/payment linked to the booking if the report is associated with one.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className={`${appBtnPrimary} w-full gap-2`}>
        <Check className="h-4 w-4" />
        {loading ? "Resolving..." : "Mark as Resolved"}
      </button>
    </form>
  );
}
