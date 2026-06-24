import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { getDelivery } from "@/services/delivery";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import { appCard, appBtnSecondary } from "@/lib/appStyles";
import DeliveryStatusControls from "@/components/delivery/DeliveryStatusControls";
import { ArrowLeft, User, Truck, MapPin, Calendar, FileText } from "lucide-react";

export default async function DeliveryDetails({ params }: { params: { id: string } }) {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");
  if (!user) redirect("/login");

  const d = await getDelivery(params.id);
  if (!d) notFound();

  return (
    <AppShell user={user} showFab={false}>
      <div className="mb-4">
        <Link href="/deliveries" className={`${appBtnSecondary} inline-flex items-center gap-2 text-xs`}>
          <ArrowLeft className="h-3 w-3" />
          Back to Deliveries
        </Link>
      </div>

      <PageHeader
        eyebrow="Delivery Dispatch"
        title="Delivery Details"
        description={d.customerName ? `Delivery for ${d.customerName}` : `Delivery ID: ${d.id.slice(0, 8)}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status & Transitions */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`${appCard} border border-zinc-800/80`}>
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Status & Operations</h3>
            <DeliveryStatusControls delivery={d} />
          </div>

          {/* Timeline Info */}
          <div className={`${appCard} border border-zinc-800/80 space-y-4`}>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Timeline</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                <span className="text-zinc-500">Created:</span>
                <span className="text-zinc-300 font-medium">{new Date(d.createdAt).toLocaleString()}</span>
              </div>
              {d.pickupAt && (
                <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                  <span className="text-zinc-500">Picked Up:</span>
                  <span className="text-zinc-300 font-medium">{new Date(d.pickupAt).toLocaleString()}</span>
                </div>
              )}
              {d.deliveredAt && (
                <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                  <span className="text-zinc-500">Delivered:</span>
                  <span className="text-zinc-300 font-medium">{new Date(d.deliveredAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`${appCard} border border-zinc-800/80 space-y-6`}>
            <div>
              <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-3">Delivery Information</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400 mt-1">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs text-zinc-500 font-semibold uppercase">Destination Address</h4>
                  <p className="mt-1 text-sm text-zinc-200 font-medium">{d.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400 mt-1">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs text-zinc-500 font-semibold uppercase">Scheduled For</h4>
                  <p className="mt-1 text-sm text-zinc-200 font-medium">
                    {new Date(d.scheduledAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400 mt-1">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs text-zinc-500 font-semibold uppercase">Driver Assigned</h4>
                  <p className="mt-1 text-sm text-zinc-200 font-medium">{d.driver || "No driver assigned"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400 mt-1">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs text-zinc-500 font-semibold uppercase">Vehicle</h4>
                  <p className="mt-1 text-sm text-zinc-200 font-medium">{d.vehicle || "No vehicle assigned"}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400 mt-1">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs text-zinc-500 font-semibold uppercase">Instructions & Notes</h4>
                  <p className="mt-1 text-sm text-zinc-200 whitespace-pre-wrap">{d.instructions || "No special instructions provided."}</p>
                </div>
              </div>
            </div>

            {d.bookingId && (
              <div className="border-t border-zinc-800 pt-6 flex items-center justify-between">
                <div>
                  <h4 className="text-xs text-zinc-500 font-semibold uppercase">Associated Booking</h4>
                  {d.bookingNumber ? (
                    <Link href={`/bookings/${d.bookingId}`} className="text-cyan-400 hover:underline font-medium text-sm mt-1 block">
                      {d.bookingNumber}
                    </Link>
                  ) : (
                    <Link href={`/bookings/${d.bookingId}`} className="text-cyan-400 hover:underline font-medium text-sm mt-1 block">
                      View Booking Detail
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

