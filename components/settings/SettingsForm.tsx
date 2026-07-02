"use client";

import { useState } from "react";
import { appBtnPrimary, appBtnSecondary, appInput } from "@/lib/appStyles";
import type { SettingsDTO } from "@/types/settings";

const paymentMethods = [
  { value: "CASH", label: "Cash" },
  { value: "CREDIT_CARD", label: "Credit card" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "CHECK", label: "Check" },
  { value: "MOBILE_WALLET", label: "Mobile wallet" },
];

const refundOptions = [
  { value: "STANDARD", label: "Standard" },
  { value: "FAST", label: "Fast" },
  { value: "DELAYED", label: "Delayed" },
];

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export default function SettingsForm({ initialSettings }: { initialSettings: SettingsDTO }) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateField(path: string, value: any) {
    setSettings((current) => {
      const next = { ...current } as any;
      const pathParts = path.split(".");
      let target = next;
      for (let i = 0; i < pathParts.length - 1; i++) {
        target = target[pathParts[i]];
      }
      target[pathParts[pathParts.length - 1]] = value;
      return next;
    });
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Could not save settings.");
      }

      setSuccess("Settings saved successfully.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-8">
      <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/50 p-6">
        <h3 className="text-base font-semibold text-white">Business profile</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            value={settings.business.name}
            onChange={(e) => updateField("business.name", e.target.value)}
            placeholder="Business name"
            className={appInput}
          />
          <input
            value={settings.business.slug}
            onChange={(e) => updateField("business.slug", e.target.value)}
            placeholder="Workspace slug"
            className={appInput}
          />
          <input
            value={settings.business.contactEmail ?? ""}
            onChange={(e) => updateField("business.contactEmail", e.target.value)}
            placeholder="Contact email"
            type="email"
            className={appInput}
          />
          <input
            value={settings.business.phone ?? ""}
            onChange={(e) => updateField("business.phone", e.target.value)}
            placeholder="Phone number"
            className={appInput}
          />
          <input
            value={settings.business.address ?? ""}
            onChange={(e) => updateField("business.address", e.target.value)}
            placeholder="Address"
            className={appInput}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/50 p-6">
        <h3 className="text-base font-semibold text-white">Rental defaults</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-zinc-300">
            <span>Default rental days</span>
            <input
              type="number"
              min={1}
              value={settings.rental.defaultRentalTermDays}
              onChange={(e) => updateField("rental.defaultRentalTermDays", Number(e.target.value))}
              className={appInput}
            />
          </label>
          <label className="space-y-2 text-sm text-zinc-300">
            <span>Allow partial returns</span>
            <select
              value={settings.rental.allowPartialReturns ? "true" : "false"}
              onChange={(e) => updateField("rental.allowPartialReturns", e.target.value === "true")}
              className={appInput}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/50 p-6">
        <h3 className="text-base font-semibold text-white">Deposit policy</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-zinc-300">
            <span>Required deposit (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={settings.deposit.requiredDepositPercent}
              onChange={(e) => updateField("deposit.requiredDepositPercent", Number(e.target.value))}
              className={appInput}
            />
          </label>
          <label className="space-y-2 text-sm text-zinc-300">
            <span>Hold period (days)</span>
            <input
              type="number"
              min={0}
              value={settings.deposit.holdPeriodDays}
              onChange={(e) => updateField("deposit.holdPeriodDays", Number(e.target.value))}
              className={appInput}
            />
          </label>
          <label className="space-y-2 text-sm text-zinc-300">
            <span>Refund policy</span>
            <select
              value={settings.deposit.refundPolicy}
              onChange={(e) => updateField("deposit.refundPolicy", e.target.value)}
              className={appInput}
            >
              {refundOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/50 p-6">
        <h3 className="text-base font-semibold text-white">Payment & invoicing</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 text-sm text-zinc-300">
            <label className="block">Accepted payment methods</label>
            <div className="grid gap-2">
              {paymentMethods.map((method) => (
                <label key={method.value} className="inline-flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={settings.payment.acceptedMethods.includes(method.value as any)}
                    onChange={(e) => {
                      const next = settings.payment.acceptedMethods.includes(method.value as any)
                        ? settings.payment.acceptedMethods.filter((item) => item !== method.value)
                        : [...settings.payment.acceptedMethods, method.value as any];
                      updateField("payment.acceptedMethods", next);
                    }}
                    className="h-4 w-4 rounded border-zinc-500 bg-slate-950 text-cyan-500"
                  />
                  {method.label}
                </label>
              ))}
            </div>
          </div>
          <label className="space-y-2 text-sm text-zinc-300">
            <span>Require transaction reference</span>
            <select
              value={settings.payment.requireTransactionReference ? "true" : "false"}
              onChange={(e) => updateField("payment.requireTransactionReference", e.target.value === "true")}
              className={appInput}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-zinc-300">
            <span>Invoice prefix</span>
            <input
              type="text"
              value={settings.invoice.invoicePrefix}
              onChange={(e) => updateField("invoice.invoicePrefix", e.target.value)}
              className={appInput}
            />
          </label>
          <label className="space-y-2 text-sm text-zinc-300">
            <span>Email invoices</span>
            <select
              value={settings.invoice.emailInvoices ? "true" : "false"}
              onChange={(e) => updateField("invoice.emailInvoices", e.target.value === "true")}
              className={appInput}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-zinc-300 sm:col-span-2">
            <span>Invoice footer</span>
            <textarea
              value={settings.invoice.invoiceFooter ?? ""}
              onChange={(e) => updateField("invoice.invoiceFooter", e.target.value)}
              className={`${appInput} min-h-30 resize-none`}
            />
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/50 p-6">
        <h3 className="text-base font-semibold text-white">Notifications & appearance</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-zinc-300">
            <span>Booking reminders</span>
            <select
              value={settings.notifications.bookingReminders ? "true" : "false"}
              onChange={(e) => updateField("notifications.bookingReminders", e.target.value === "true")}
              className={appInput}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-zinc-300">
            <span>Low inventory alerts</span>
            <select
              value={settings.notifications.lowInventoryAlerts ? "true" : "false"}
              onChange={(e) => updateField("notifications.lowInventoryAlerts", e.target.value === "true")}
              className={appInput}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-zinc-300">
            <span>Payment receipts</span>
            <select
              value={settings.notifications.paymentReceipts ? "true" : "false"}
              onChange={(e) => updateField("notifications.paymentReceipts", e.target.value === "true")}
              className={appInput}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-zinc-300">
            <span>Brand color</span>
            <input
              type="color"
              value={settings.appearance.brandColor}
              onChange={(e) => updateField("appearance.brandColor", e.target.value)}
              className="h-12 w-full rounded-2xl border border-zinc-700 bg-slate-950 px-3 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-zinc-300 sm:col-span-2">
            <span>Theme</span>
            <select
              value={settings.appearance.theme}
              onChange={(e) => updateField("appearance.theme", e.target.value)}
              className={appInput}
            >
              {themeOptions.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-zinc-300 sm:col-span-2">
            <span>Workspace logo URL</span>
            <input
              type="url"
              value={settings.appearance.logoUrl ?? ""}
              onChange={(e) => updateField("appearance.logoUrl", e.target.value)}
              placeholder="https://..."
              className={appInput}
            />
          </label>
        </div>
      </section>

      {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
      {success ? <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={loading} className={appBtnPrimary}>
          {loading ? "Saving..." : "Save settings"}
        </button>
        <button type="button" disabled={loading} onClick={() => window.location.reload()} className={appBtnSecondary}>
          Reload
        </button>
      </div>
    </form>
  );
}
