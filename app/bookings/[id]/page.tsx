import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import { getBooking } from "@/services/booking";
import AppShell from "@/components/layout/AppShell";
import BookingReturnForm from "@/components/bookings/BookingReturnForm";
import BookingStatusControls from "@/components/bookings/BookingStatusControls";
import { appCard, appCardInner, appEyebrow } from "@/lib/appStyles";
import { ArrowLeft, Calendar, MapPin, Package, CreditCard } from "lucide-react";
import { listPayments } from "@/services/finance";

type PageProps = {
  params: Promise<{ id: string }>;
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-400/15 text-amber-200 border-amber-400/25",
  CONFIRMED: "bg-emerald-400/15 text-emerald-200 border-emerald-400/25",
  IN_PROGRESS: "bg-cyan-400/15 text-cyan-200 border-cyan-400/25",
  COMPLETED: "bg-emerald-400/15 text-emerald-200 border-emerald-400/25",
  CANCELLED: "bg-rose-400/15 text-rose-200 border-rose-400/25",
  NO_SHOW: "bg-zinc-500/20 text-zinc-300 border-zinc-500/25",
};

export default async function BookingDetailPage({ params }: PageProps) {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const booking = await getBooking(id);

  if (!booking) {
    notFound();
  }

  const allPayments = await listPayments();
  const bookingPayments = allPayments.filter((p) => p.bookingId === booking.id);

  return (
    <AppShell user={user} showFab={false}>
      {/* Back nav */}
      <Link
        href="/bookings"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-cyan-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to bookings
      </Link>

      {/* Header */}
      <div className={appCard}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={appEyebrow}>Booking details</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              {booking.bookingNumber}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {booking.customer.firstName} {booking.customer.lastName}
              {booking.customer.email ? ` · ${booking.customer.email}` : ""}
              {booking.customer.phone ? ` · ${booking.customer.phone}` : ""}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-semibold ${statusColors[booking.status] ?? statusColors.PENDING}`}
          >
            {booking.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        {/* LEFT column */}
        <div className="space-y-5">
          {/* Timeline */}
          <section className={appCard}>
            <p className={appEyebrow}>
              <Calendar className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
              Timeline
            </p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div className={appCardInner}>
                <p className="text-xs uppercase tracking-widest text-zinc-500">Event date</p>
                <p className="mt-2 font-semibold text-white">
                  {new Date(booking.eventDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className={appCardInner}>
                <p className="text-xs uppercase tracking-widest text-zinc-500">Delivery date</p>
                <p className="mt-2 font-semibold text-white">
                  {booking.deliveryDate
                    ? new Date(booking.deliveryDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "Not scheduled"}
                </p>
              </div>
              <div className={appCardInner}>
                <p className="text-xs uppercase tracking-widest text-zinc-500">Return date</p>
                <p className="mt-2 font-semibold text-white">
                  {booking.returnDate
                    ? new Date(booking.returnDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "Open"}
                </p>
              </div>
            </div>
            {booking.notes && (
              <div className={`${appCardInner} mt-3`}>
                <p className="text-xs uppercase tracking-widest text-zinc-500">Notes</p>
                <p className="mt-2 text-sm text-zinc-300">{booking.notes}</p>
              </div>
            )}
          </section>

          {/* Items */}
          <section className={appCard}>
            <p className={appEyebrow}>
              <Package className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
              Rented items
            </p>
            <div className="mt-4 space-y-3">
              {booking.bookingItems.map((item) => {
                const fullyReturned = item.returnedQuantity >= item.quantity;
                return (
                  <div
                    key={item.id}
                    className={`${appCardInner} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-white">{item.inventoryItemName}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        Qty: {item.quantity} · Unit: GHC{item.unitPrice.toFixed(2)} · Line: GHC
                        {item.totalPrice.toFixed(2)}
                        {item.discount > 0 ? ` · Discount: GHC${item.discount.toFixed(2)}` : ""}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        fullyReturned
                          ? "bg-emerald-400/15 text-emerald-200"
                          : item.returnedQuantity > 0
                            ? "bg-amber-400/15 text-amber-200"
                            : "bg-zinc-500/20 text-zinc-300"
                      }`}
                    >
                      Returned {item.returnedQuantity}/{item.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Payments */}
          <section className={appCard}>
            <p className={appEyebrow}>
              <CreditCard className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
              Payment history
            </p>
            <div className="mt-4 space-y-3">
              {bookingPayments.length === 0 ? (
                <p className="text-sm text-zinc-500">No payments recorded yet.</p>
              ) : (
                bookingPayments.map((p) => (
                  <div key={p.id} className={`${appCardInner} flex items-center justify-between gap-3 text-sm`}>
                    <div>
                      <p className="font-semibold text-white">GHC{p.amount.toFixed(2)}</p>
                      <p className="text-xs text-zinc-500">
                        {p.method.replace("_", " ")} ·{" "}
                        {p.processedAt
                          ? new Date(p.processedAt).toLocaleDateString()
                          : new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.status === "COMPLETED"
                          ? "bg-emerald-400/15 text-emerald-200"
                          : "bg-amber-400/15 text-amber-200"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* RIGHT column */}
        <div className="space-y-5">
          {/* Status controls */}
          <BookingStatusControls booking={booking} />

          {/* Financial summary */}
          <section className={appCard}>
            <p className={appEyebrow}>Financial summary</p>
            <div className="mt-4 space-y-2.5 text-sm">
              {[
                { label: "Items subtotal", value: booking.bookingItems.reduce((s, i) => s + i.totalPrice, 0) },
                { label: "Delivery fee", value: booking.deliveryFee },
                { label: "Setup fee", value: booking.setupFee },
                { label: "Discount", value: -booking.discount },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-zinc-400">
                  <span>{label}</span>
                  <span className={value < 0 ? "text-rose-300" : "text-zinc-200"}>
                    {value < 0 ? `-GHC${Math.abs(value).toFixed(2)}` : `GHC${value.toFixed(2)}`}
                  </span>
                </div>
              ))}
              <div className="my-2 border-t border-white/10" />
              <div className="flex justify-between font-semibold">
                <span className="text-zinc-300">Total</span>
                <span className="text-white">GHC{booking.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Deposit paid</span>
                <span className="text-emerald-200">GHC{booking.depositAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-zinc-300">Balance due</span>
                <span
                  className={booking.balanceDue > 0 ? "text-amber-200" : "text-emerald-200"}
                >
                  GHC{booking.balanceDue.toFixed(2)}
                </span>
              </div>
            </div>
          </section>

          {/* Item return form */}
          {!["COMPLETED", "CANCELLED"].includes(booking.status) && (
            <BookingReturnForm booking={booking} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
