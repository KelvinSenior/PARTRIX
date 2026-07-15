import Link from "next/link";
import { MapPin, Truck, Calendar } from "lucide-react";
import { appCard } from "@/lib/appStyles";
import type { DeliveryDTO } from "@/types/delivery";

const statusStyles: Record<string, string> = {
  SCHEDULED: "border border-cyan-300/80 bg-cyan-50 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/15 dark:text-cyan-200",
  IN_TRANSIT: "border border-amber-300/80 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/15 dark:text-amber-200",
  DELIVERED: "border border-emerald-300/80 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/15 dark:text-emerald-200",
  COMPLETED: "border border-slate-300/80 bg-slate-100 text-slate-700 dark:border-zinc-500/20 dark:bg-zinc-500/15 dark:text-zinc-300",
  CANCELLED: "border border-rose-300/80 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/15 dark:text-rose-200",
};

export default function DeliveryCard({ delivery }: { delivery: DeliveryDTO }) {
  return (
    <Link href={`/deliveries/${delivery.id}`} className="block transition hover:translate-y-[-2px]">
      <article className={`${appCard} h-full border border-slate-200/80 dark:border-zinc-800/80`}>
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/80 bg-cyan-100 text-cyan-700 shadow-sm dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
            <Truck className="h-4 w-4" aria-hidden />
          </span>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[delivery.status] ?? "border-slate-300/80 bg-slate-100 text-slate-700 dark:border-zinc-500/20 dark:bg-zinc-500/15 dark:text-zinc-300"}`}>
            {delivery.status}
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {delivery.bookingNumber && (
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Booking: <span className="font-semibold text-slate-900 dark:text-zinc-200">{delivery.bookingNumber}</span>
            </p>
          )}
          {delivery.customerName && (
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {delivery.customerName}
            </p>
          )}
          <p className="flex items-start gap-2 text-sm text-slate-700 dark:text-zinc-300">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700 dark:text-cyan-300/80" aria-hidden />
            <span>{delivery.address}</span>
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-2 text-xs text-slate-500 dark:border-zinc-800/50 dark:text-zinc-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Scheduled: {new Date(delivery.scheduledAt).toLocaleDateString()}
          </span>
        </div>
      </article>
    </Link>
  );
}

