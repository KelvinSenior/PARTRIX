import Link from "next/link";
import { MapPin, Truck, Calendar } from "lucide-react";
import { appCard } from "@/lib/appStyles";
import type { DeliveryDTO } from "@/types/delivery";

const statusStyles: Record<string, string> = {
  SCHEDULED: "bg-cyan-400/15 text-cyan-200 border-cyan-400/20",
  IN_TRANSIT: "bg-amber-400/15 text-amber-200 border-amber-400/20",
  DELIVERED: "bg-emerald-400/15 text-emerald-200 border-emerald-400/20",
  COMPLETED: "bg-zinc-500/15 text-zinc-300 border-zinc-500/20",
  CANCELLED: "bg-rose-400/15 text-rose-200 border-rose-400/20",
};

export default function DeliveryCard({ delivery }: { delivery: DeliveryDTO }) {
  return (
    <Link href={`/deliveries/${delivery.id}`} className="block transition hover:translate-y-[-2px]">
      <article className={`${appCard} h-full border border-zinc-800/80`}>
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">
            <Truck className="h-4 w-4" aria-hidden />
          </span>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[delivery.status] ?? "bg-zinc-500/20 text-zinc-300"}`}>
            {delivery.status}
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {delivery.bookingNumber && (
            <p className="text-xs text-zinc-400">
              Booking: <span className="font-semibold text-zinc-200">{delivery.bookingNumber}</span>
            </p>
          )}
          {delivery.customerName && (
            <p className="text-sm font-medium text-white">
              {delivery.customerName}
            </p>
          )}
          <p className="flex items-start gap-2 text-sm text-zinc-300">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/80" aria-hidden />
            <span>{delivery.address}</span>
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/50 pt-2">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Scheduled: {new Date(delivery.scheduledAt).toLocaleDateString()}
          </span>
        </div>
      </article>
    </Link>
  );
}

