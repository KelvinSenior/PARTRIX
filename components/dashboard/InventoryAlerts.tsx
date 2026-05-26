"use client";

import Link from "next/link";
import type { InventoryItemDTO } from "@/types/inventory";

function getSeverityClass(available: number, minimum: number) {
  if (available === 0) return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";
  if (available <= minimum) return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300";
}

function getSeverityLabel(available: number, minimum: number) {
  if (available === 0) return "Out of stock";
  if (available <= minimum) return "Low stock";
  return "Reorder soon";
}

export default function InventoryAlerts({ items }: { items: InventoryItemDTO[] }) {
  const alerts = items
    .filter(item => item.availableQuantity <= item.minimumThreshold)
    .slice(0, 6);

  return (
    <div id="inventory" className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm shadow-zinc-200/30 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-zinc-950/15">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Inventory alerts</p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Stock health</h2>
        </div>
        <span className="rounded-full bg-pink-100 px-3 py-2 text-sm font-semibold text-pink-700 dark:bg-pink-500/15 dark:text-pink-300">{alerts.length} items low</span>
      </div>

      <div className="mt-6 space-y-4">
        {alerts.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">All inventory levels are healthy</div>
        ) : (
          alerts.map((item) => (
            <div key={item.id} className="rounded-3xl border border-zinc-200/75 bg-zinc-50 p-4 dark:border-zinc-800/70 dark:bg-zinc-900/90">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-zinc-950 dark:text-zinc-100">{item.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Only {item.availableQuantity} left • Min: {item.minimumThreshold}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getSeverityClass(item.availableQuantity, item.minimumThreshold)}`}>
                  {getSeverityLabel(item.availableQuantity, item.minimumThreshold)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <Link href="/inventory" className="mt-4 inline-block rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800">
        Manage inventory
      </Link>
    </div>
  );
}
