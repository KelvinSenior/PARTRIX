import Link from "next/link";
import { MapPin, Truck } from "lucide-react";
import { appCard } from "@/lib/appStyles";

const statusStyles: Record<string, string> = {
  SCHEDULED: "bg-cyan-400/15 text-cyan-200",
  IN_TRANSIT: "bg-amber-400/15 text-amber-200",
  DELIVERED: "bg-emerald-400/15 text-emerald-200",
  CANCELLED: "bg-rose-400/15 text-rose-200",
};

export default function DeliveryCard({ delivery }: { delivery: { id: string; pickupAddress: string; dropoffAddress: string; status: string; createdAt: string | Date } }) {
  return (
    <Link href={`/deliveries/${delivery.id}`} className="block transition hover:translate-y-[-2px]">
      <article className={`${appCard} h-full`}>
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">
            <Truck className="h-4 w-4" aria-hidden />
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[delivery.status] ?? "bg-zinc-500/20 text-zinc-300"}`}>
            {delivery.status}
          </span>
        </div>
        <div className="mt-4 space-y-2">
          <p className="flex items-start gap-2 text-sm font-medium text-white">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/80" aria-hidden />
            <span>{delivery.pickupAddress}</span>
          </p>
          <p className="pl-6 text-sm text-zinc-400">→ {delivery.dropoffAddress}</p>
        </div>
        <p className="mt-4 text-xs text-zinc-500">{new Date(delivery.createdAt).toLocaleString()}</p>
      </article>
    </Link>
  );
}
