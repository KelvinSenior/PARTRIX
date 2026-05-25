"use client";

const alerts = [
  { label: "Folding tables", quantity: 4, status: "Low stock" },
  { label: "LED uplights", quantity: 3, status: "Reorder soon" },
  { label: "Speaker sets", quantity: 2, status: "Critical" },
];

export default function InventoryAlerts() {
  return (
    <div id="inventory" className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm shadow-zinc-200/30 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-zinc-950/15">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Inventory alerts</p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Stock health</h2>
        </div>
        <span className="rounded-full bg-pink-100 px-3 py-2 text-sm font-semibold text-pink-700 dark:bg-pink-500/15 dark:text-pink-300">3 items low</span>
      </div>

      <div className="mt-6 space-y-4">
        {alerts.map((alert) => (
          <div key={alert.label} className="rounded-3xl border border-zinc-200/75 bg-zinc-50 p-4 dark:border-zinc-800/70 dark:bg-zinc-900/90">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-zinc-950 dark:text-zinc-100">{alert.label}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Only {alert.quantity} left</p>
              </div>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {alert.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
