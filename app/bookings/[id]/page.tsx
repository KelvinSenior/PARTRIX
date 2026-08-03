import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import { getBooking } from "@/services/booking";
import AppShell from "@/components/layout/AppShell";
import BookingPaymentForm from "@/components/bookings/BookingPaymentForm";
import BookingReturnForm from "@/components/bookings/BookingReturnForm";
import BookingStatusControls from "@/components/bookings/BookingStatusControls";
import InvoiceActions from "@/components/bookings/InvoiceActions";
import BookingItemEditor from "@/components/bookings/BookingItemEditor";
import { appCard, appCardInner, appEyebrow } from "@/lib/appStyles";
import { ArrowLeft, Package, CreditCard } from "lucide-react";
import { listPayments } from "@/services/finance";
import { getOrganizationSettings } from "@/services/settings";
import { formatAmount } from "@/lib/branding";

type PageProps = {
  params: Promise<{ id: string }>;
};

const statusColors: Record<string, string> = {
  PENDING: "border border-amber-300/80 bg-amber-50 text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/15 dark:text-amber-200",
  CONFIRMED: "border border-emerald-300/80 bg-emerald-50 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/15 dark:text-emerald-200",
  IN_PROGRESS: "border border-cyan-300/80 bg-cyan-50 text-cyan-700 dark:border-cyan-400/25 dark:bg-cyan-400/15 dark:text-cyan-200",
  COMPLETED: "border border-emerald-300/80 bg-emerald-50 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/15 dark:text-emerald-200",
  CANCELLED: "border border-rose-300/80 bg-rose-50 text-rose-700 dark:border-rose-400/25 dark:bg-rose-400/15 dark:text-rose-200",
  NO_SHOW: "border border-slate-300/80 bg-slate-100 text-slate-700 dark:border-zinc-500/25 dark:bg-zinc-500/20 dark:text-zinc-300",
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
  const settings = await getOrganizationSettings();

  return (
    <AppShell user={user} showFab={false}>
      {/* Back nav */}
      <Link
        href="/bookings"
        className="inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-cyan-700 dark:text-zinc-400 dark:hover:text-cyan-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to bookings
      </Link>

      {/* Header */}
      <section className={`${appCard} overflow-hidden`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className={appEyebrow}>Booking details</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {booking.bookingNumber}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
              {booking.customer.firstName} {booking.customer.lastName}
              {booking.customer.email ? ` · ${booking.customer.email}` : ""}
              {booking.customer.phone ? ` · ${booking.customer.phone}` : ""}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <span
              className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-semibold ${statusColors[booking.status] ?? statusColors.PENDING}`}
            >
              {booking.status.replace(/_/g, " ")}
            </span>
            <span className="inline-flex items-center rounded-full border border-cyan-300/70 bg-cyan-50 px-3.5 py-1.5 text-sm font-semibold text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100">
              Deposit {booking.depositStatus.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className={appCardInner}>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-zinc-500">Event date</p>
            <p className="mt-2 font-semibold text-slate-900 dark:text-white">
              {new Date(booking.eventDate).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className={appCardInner}>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-zinc-500">Delivery date</p>
            <p className="mt-2 font-semibold text-slate-900 dark:text-white">
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
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-zinc-500">Return date</p>
            <p className="mt-2 font-semibold text-slate-900 dark:text-white">
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
                <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-zinc-500">Notes</p>
                <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">{booking.notes}</p>
              </div>
            )}
          </section>

      <div className="grid gap-5 xl:grid-cols-[1.9fr_0.9fr]">
        <div className="space-y-5">
          {/* Items */}
          <BookingItemEditor booking={booking} settings={settings} />

          {/* Payments */}
          <section className={appCard}>
            <p className={appEyebrow}>
              <CreditCard className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
              Payment history
            </p>
            <div className="mt-4 space-y-3">
              {bookingPayments.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-zinc-500">No payments recorded yet.</p>
              ) : (
                bookingPayments.map((p) => (
                  <div key={p.id} className={`${appCardInner} flex items-center justify-between gap-3 text-sm`}>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{formatAmount(p.amount, settings)}</p>
                      <p className="text-xs text-slate-600 dark:text-zinc-500">
                        {p.method.replace("_", " ")} ·{" "}
                        {p.processedAt
                          ? new Date(p.processedAt).toLocaleDateString()
                          : new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        p.status === "COMPLETED"
                          ? "border-emerald-300/80 bg-emerald-50 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/15 dark:text-emerald-200"
                          : "border-amber-300/80 bg-amber-50 text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/15 dark:text-amber-200"
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

          <InvoiceActions bookingId={booking.id} customerEmail={booking.customer.email} />

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
                <div key={label} className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>{label}</span>
                  <span className={value < 0 ? "text-rose-700 dark:text-rose-300" : "text-slate-900 dark:text-zinc-200"}>
                    {value < 0 ? `-${formatAmount(Math.abs(value), settings)}` : formatAmount(value, settings)}
                  </span>
                </div>
              ))}
              <div className="my-2 border-t border-white/10" />
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700 dark:text-zinc-300">Total</span>
                <span className="text-slate-900 dark:text-white">{formatAmount(booking.totalAmount, settings)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Refundable deposit amount</span>
                <span className="text-emerald-700 dark:text-emerald-200">{formatAmount(booking.depositAmount, settings)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Refundable deposit paid</span>
                <span className="text-emerald-700 dark:text-emerald-200">{formatAmount(booking.depositPaid, settings)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Refundable deposit refunded</span>
                <span className="text-amber-700 dark:text-amber-200">{formatAmount(booking.depositRefunded, settings)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Refundable deposit outstanding</span>
                <span className="text-cyan-700 dark:text-cyan-200">{formatAmount(booking.depositOutstanding, settings)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Refundable deposit status</span>
                <span className="font-semibold text-slate-900 dark:text-white">{booking.depositStatus.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Refund status</span>
                <span className="font-semibold text-slate-900 dark:text-white">{booking.refundStatus.replace(/_/g, " ")}</span>
              </div>
              <div className="my-2 border-t border-white/10" />
              <div className="flex justify-between font-semibold">
                <span className="text-zinc-300">Balance due</span>
                <span
                  className={booking.balanceDue > 0 ? "text-amber-200" : "text-emerald-200"}
                >
                  {formatAmount(booking.balanceDue, settings)}
                </span>
              </div>
            </div>
          </section>

          <BookingPaymentForm bookingId={booking.id} settings={settings} />

          {/* Item return form */}
          {!["COMPLETED", "CANCELLED"].includes(booking.status) && (
            <BookingReturnForm booking={booking} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
