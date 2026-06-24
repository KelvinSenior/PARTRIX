import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { getDamageReport } from "@/services/damage";
import { getCurrentUserFromToken } from "@/services/auth";
import { getAuthCookie } from "@/lib/cookies";
import { appCard, appCardInner, appBtnSecondary } from "@/lib/appStyles";
import DamageResolveForm from "@/components/damage/DamageResolveForm";
import { ArrowLeft, AlertTriangle, CheckCircle2, Calendar, Clipboard, Hammer } from "lucide-react";

export default async function DamageDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUserFromToken((await getAuthCookie()) ?? "");
  if (!user) redirect("/login");

  const d = await getDamageReport(params.id);
  if (!d) notFound();

  return (
    <AppShell user={user} showFab={false}>
      <div className="mb-4">
        <Link href="/damage" className={`${appBtnSecondary} inline-flex items-center gap-2 text-xs`}>
          <ArrowLeft className="h-3 w-3" />
          Back to Damage Reports
        </Link>
      </div>

      <PageHeader
        eyebrow="Damage Log"
        title="Damage Report Details"
        description={`Report for ${d.inventoryItemName ?? "Unknown Item"}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status widget */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`${appCard} border border-zinc-800/80`}>
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Status</h3>
            {d.resolved ? (
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-sm font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Resolved
                </span>
                {d.resolvedAt && (
                  <p className="text-xs text-zinc-500">
                    Resolved at: <span className="text-zinc-300">{new Date(d.resolvedAt).toLocaleString()}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-sm font-semibold text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  Unresolved
                </span>
                <div className="border-t border-zinc-800/50 pt-4">
                  <DamageResolveForm damageReportId={d.id} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Fields */}
        <div className="lg:col-span-2">
          <div className={`${appCard} border border-zinc-800/80 space-y-6`}>
            <div>
              <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-3">Incident Details</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400 mt-1">
                  <Clipboard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs text-zinc-500 font-semibold uppercase">Item Name</h4>
                  <p className="mt-1 text-sm text-zinc-200 font-medium">{d.inventoryItemName ?? "Unknown Item"}</p>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">ID: {d.inventoryItemId}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400 mt-1">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs text-zinc-500 font-semibold uppercase">Reported Date</h4>
                  <p className="mt-1 text-sm text-zinc-200 font-medium">
                    {new Date(d.reportDate).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-800/80 text-zinc-400 mt-1">
                  <Hammer className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs text-zinc-500 font-semibold uppercase">Quantity / Severity</h4>
                  <p className="mt-1 text-sm text-zinc-200 font-medium">
                    Qty: {d.quantity} &middot; Severity: <span className={
                      d.severity === "SEVERE" ? "text-rose-400" : d.severity === "MODERATE" ? "text-amber-400" : "text-cyan-400"
                    }>{d.severity}</span>
                  </p>
                </div>
              </div>
            </div>

            {d.notes && (
              <div className="border-t border-zinc-800 pt-6">
                <h4 className="text-xs text-zinc-500 font-semibold uppercase mb-2">Notes</h4>
                <p className="text-sm text-zinc-200 whitespace-pre-wrap bg-white/5 p-4 rounded-xl border border-white/5">{d.notes}</p>
              </div>
            )}

            {d.bookingId && (
              <div className="border-t border-zinc-800 pt-6 flex items-center justify-between">
                <div>
                  <h4 className="text-xs text-zinc-500 font-semibold uppercase">Associated Booking</h4>
                  <Link href={`/bookings/${d.bookingId}`} className="text-cyan-400 hover:underline font-medium text-sm mt-1 block">
                    View Associated Booking
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

