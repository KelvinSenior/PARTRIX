import Link from "next/link";
import type { DamageReportDTO } from "@/types/damage";

export default function DamageCard({ d }: { d: DamageReportDTO }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{d.inventoryItemName ?? d.inventoryItemId}</h3>
          <p className="text-xs text-zinc-600">Qty: {d.quantity} • Severity: {d.severity}</p>
        </div>
        <div>
          {!d.resolved ? <span className="text-sm text-amber-600">Unresolved</span> : <span className="text-sm text-green-600">Resolved</span>}
        </div>
      </div>
      <p className="mt-2 text-sm text-zinc-700">{d.notes}</p>
      <div className="mt-3 text-right">
        <Link href={`/damage/${d.id}`} className="text-indigo-600">View</Link>
      </div>
    </div>
  );
}
