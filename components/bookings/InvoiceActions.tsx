"use client";

import { useState } from "react";
import { Download, Mail } from "lucide-react";
import { appBtnPrimary, appBtnSecondary, appInput } from "@/lib/appStyles";
import { toastError, toastSuccess } from "@/components/ui/Toast";

type InvoiceActionsProps = {
  bookingId: string;
  customerEmail?: string | null;
};

export default function InvoiceActions({ bookingId, customerEmail }: InvoiceActionsProps) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(customerEmail ?? "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function sendInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/invoice/send`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, message: message || undefined }),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const fieldMessage = body?.details?.fields
          ? Object.values(body.details.fields).flat().filter(Boolean).join(" ")
          : null;
        throw new Error(fieldMessage || body?.message || "Could not send invoice.");
      }

      toastSuccess("Invoice sent.");
      setOpen(false);
    } catch (error) {
      toastError((error as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/75">Invoice</p>
        <h3 className="mt-2 text-lg font-semibold text-white">PDF invoice</h3>
        <p className="mt-1 text-sm text-zinc-400">Download or email a polished invoice for this booking.</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a href={`/api/bookings/${bookingId}/invoice`} className={appBtnSecondary}>
          <Download className="h-4 w-4" aria-hidden />
          Download PDF
        </a>
        <button type="button" onClick={() => setOpen(true)} className={appBtnPrimary}>
          <Mail className="h-4 w-4" aria-hidden />
          Send invoice
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-cyan-200/15 bg-[#050816] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Send invoice</h3>
                <p className="mt-1 text-sm text-zinc-400">The invoice PDF will be attached to the email.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300"
              >
                Close
              </button>
            </div>

            <form onSubmit={sendInvoice} className="mt-5 space-y-4">
              <label className="block text-sm text-zinc-300">
                Recipient email
                <input
                  type="email"
                  required
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  className={`${appInput} mt-2`}
                />
              </label>
              <label className="block text-sm text-zinc-300">
                Message
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={4}
                  className={`${appInput} mt-2 h-auto min-h-[120px] resize-none py-3`}
                  placeholder="Optional message to include in the email."
                />
              </label>
              <button type="submit" disabled={sending} className={`${appBtnPrimary} w-full`}>
                {sending ? "Sending..." : "Send invoice PDF"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
