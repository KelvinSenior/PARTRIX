import { notFound, redirect } from "next/navigation";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import { getBooking } from "@/services/booking";
import BookingReturnForm from "@/components/bookings/BookingReturnForm";

type PageProps = {
  params: { id: string };
};

export default async function BookingDetailPage({ params }: PageProps) {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");

  if (!user) {
    redirect("/login");
  }

  const booking = await getBooking(params.id);

  if (!booking) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 lg:px-8">
        <div className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-8 shadow-lg shadow-zinc-200/40 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/95 dark:shadow-zinc-950/20">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Booking details</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{booking.bookingNumber}</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">{booking.customer.firstName} {booking.customer.lastName} · {booking.customer.email}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[520px_1fr]">
          <div className="space-y-6">
            <section className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm shadow-zinc-200/30 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-zinc-950/15">
              <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Timeline</h2>
              <div className="mt-5 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <p><strong>Event date:</strong> {new Date(booking.eventDate).toLocaleDateString()}</p>
                <p><strong>Delivery date:</strong> {booking.deliveryDate ? new Date(booking.deliveryDate).toLocaleDateString() : "Not scheduled"}</p>
                <p><strong>Return date:</strong> {booking.returnDate ? new Date(booking.returnDate).toLocaleDateString() : "Open"}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                <p><strong>Notes:</strong> {booking.notes ?? "None"}</p>
              </div>
            </section>

            <section className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm shadow-zinc-200/30 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-zinc-950/15">
              <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Items</h2>
              <div className="mt-4 space-y-4">
                {booking.bookingItems.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-semibold text-zinc-950 dark:text-zinc-100">{item.inventoryItemName}</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Returned {item.returnedQuantity} / {item.quantity}</p>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Quantity: {item.quantity}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Discount: ${item.discount.toFixed(2)}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Line total: ${item.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[32px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm shadow-zinc-200/30 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-zinc-950/15">
              <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Financial summary</h2>
              <div className="mt-5 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <p><strong>Delivery fee:</strong> ${booking.deliveryFee.toFixed(2)}</p>
                <p><strong>Setup fee:</strong> ${booking.setupFee.toFixed(2)}</p>
                <p><strong>Booking discount:</strong> ${booking.discount.toFixed(2)}</p>
                <p><strong>Total amount:</strong> ${booking.totalAmount.toFixed(2)}</p>
                <p><strong>Deposit:</strong> ${booking.depositAmount.toFixed(2)}</p>
                <p><strong>Balance due:</strong> ${booking.balanceDue.toFixed(2)}</p>
              </div>
            </section>

            <BookingReturnForm booking={booking} />
          </div>
        </div>
      </div>
    </main>
  );
}
