"use client";

import Link from "next/link";
import type { InventoryItemDTO } from "@/types/inventory";
import { appCard, appCardInner, appEyebrow, appTitle } from "@/lib/appStyles";

function getSeverityClass(available: number, minimum: number) {
  if (available === 0) return "bg-rose-400/15 text-rose-200";
  if (available <= minimum) return "bg-amber-400/15 text-amber-200";
  return "bg-yellow-400/15 text-yellow-200";
}

function getSeverityLabel(available: number, minimum: number) {
  if (available === 0) return "Out of stock";
  if (available <= minimum) return "Low stock";
  return "Reorder soon";
}

export default function InventoryAlerts({ items }: { items: InventoryItemDTO[] }) {
  const alerts = items.filter((item) => item.availableQuantity <= item.minimumThreshold).slice(0, 6);

  return (
    <div id="inventory" className={appCard}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={appEyebrow}>Inventory alerts</p>
          <h2 className={`${appTitle} mt-2 text-xl`}>Stock health</h2>
        </div>
        <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-200">
          {alerts.length} low
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {alerts.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">All inventory levels are healthy</p>
        ) : (
          alerts.map((item) => (
            <div key={item.id} className={appCardInner}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{item.name}</p>
                  <p className="text-xs text-zinc-500">{item.sku}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getSeverityClass(item.availableQuantity, item.minimumThreshold)}`}
                >
                  {getSeverityLabel(item.availableQuantity, item.minimumThreshold)}
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                {item.availableQuantity} available · threshold {item.minimumThreshold}
              </p>
            </div>
          ))
        )}
      </div>

      <Link href="/inventory" className="mt-4 inline-block text-sm font-medium text-cyan-200 hover:text-cyan-100">
        Manage inventory →
      </Link>
    </div>
  );
}
