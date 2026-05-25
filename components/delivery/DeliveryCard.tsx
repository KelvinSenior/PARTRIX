import Link from "next/link";

export default function DeliveryCard({ delivery }: { delivery: any }) {
  return (
    <Link href={`/deliveries/${delivery.id}`}>
      <div className="rounded-xl border p-4 hover:shadow-md bg-white dark:bg-zinc-950 dark:border-zinc-800">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">{delivery.pickupAddress} → {delivery.dropoffAddress}</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Status: <span className="font-medium">{delivery.status}</span></p>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">{new Date(delivery.createdAt).toLocaleString()}</div>
        </div>
      </div>
    </Link>
  );
}
