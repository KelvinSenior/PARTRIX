import Link from "next/link";
import type { DamageReportDTO } from "@/types/damage";
import { appCard, appBtnSecondary } from "@/lib/appStyles";
import { AlertTriangle, CheckCircle, Eye } from "lucide-react";

export default function DamageCard({ d }: { d: DamageReportDTO }) {
  return (
    <div className={`${appCard} border border-zinc-800/80`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-300">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold text-white">
              {d.inventoryItemName ?? "Unknown Item"}
            </h3>
          </div>
          <p className="text-xs text-zinc-400 pl-10">
            Qty: <span className="text-zinc-200 font-semibold">{d.quantity}</span> • Severity:{" "}
            <span className={`font-semibold ${
              d.severity === "SEVERE" ? "text-rose-400" : d.severity === "MODERATE" ? "text-amber-400" : "text-cyan-400"
            }`}>{d.severity}</span>
          </p>
        </div>
        <div>
          {d.resolved ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
              <CheckCircle className="h-3 w-3" />
              Resolved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
              <AlertTriangle className="h-3 w-3" />
              Unresolved
            </span>
          )}
        </div>
      </div>
      {d.notes && (
        <p className="mt-3 text-sm text-zinc-300 bg-white/5 p-3 rounded-lg border border-white/5 whitespace-pre-line">
          {d.notes}
        </p>
      )}
      <div className="mt-4 flex justify-end">
        <Link href={`/damage/${d.id}`} className={`${appBtnSecondary} gap-1 px-3 py-1.5 text-xs`}>
          <Eye className="h-3.5 w-3.5" />
          View details
        </Link>
      </div>
    </div>
  );
}

