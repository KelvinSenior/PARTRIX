"use client";

import { useEffect, useState } from "react";
import { appBtnPrimary, appBtnSecondary, appInput } from "@/lib/appStyles";
import type { SettingsDTO } from "@/types/settings";
import type { PaymentMethod } from "@/types/finance";
import BusinessIdentityForm from "@/components/settings/BusinessIdentityForm";

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

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_10px_34px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-950/50 dark:shadow-none sm:p-5">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        <span className="rounded-full border border-cyan-200/20 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      <div className={`grid transition-all duration-300 ${open ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
}

export default function SettingsForm({ initialSettings }: { initialSettings: SettingsDTO }) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
    setDirty(false);
  }, [initialSettings]);

  function updateField(path: string, value: any) {
    setDirty(true);
    setSettings((current) => {
      const next = structuredClone(current) as any;
      const pathParts = path.split(".");
      let target = next;
      for (let i = 0; i < pathParts.length - 1; i++) {
        target = target[pathParts[i]];
      }
      target[pathParts[pathParts.length - 1]] = value;
      return next;
    });
  }

  function handleSettingsChange(nextSettings: SettingsDTO) {
    setDirty(true);
    setSettings(nextSettings);
  }

  async function save(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
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
        const fieldMessage = body?.details?.fields
          ? Object.values(body.details.fields).flat().filter(Boolean).join(" ")
          : null;
        throw new Error(fieldMessage || body?.message || "Could not save settings.");
      }

      const body = await res.json();
      if (body?.settings) {
        setSettings(body.settings);
      }
      setDirty(false);
      setSuccess("Settings saved successfully.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-8">
      <BusinessIdentityForm
        settings={settings}
        onChange={handleSettingsChange}
        onSave={() => void save()}
        saving={loading}
        error={error}
        success={success}
      />

      <CollapsibleSection title="Rental defaults" defaultOpen>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700 dark:text-zinc-300">
            <span>Default rental days</span>
            <input
              type="number"
              min={1}
              value={settings.rental.defaultRentalTermDays}
              onChange={(e) => updateField("rental.defaultRentalTermDays", Number(e.target.value))}
              className={appInput}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700 dark:text-zinc-300">
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
      </CollapsibleSection>

      <CollapsibleSection title="Deposit policy">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700 dark:text-zinc-300">
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
          <label className="space-y-2 text-sm text-slate-700 dark:text-zinc-300">
            <span>Hold period (days)</span>
            <input
              type="number"
              min={0}
              value={settings.deposit.holdPeriodDays}
              onChange={(e) => updateField("deposit.holdPeriodDays", Number(e.target.value))}
              className={appInput}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700 dark:text-zinc-300">
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
      </CollapsibleSection>

      <CollapsibleSection title="Payment & invoicing">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 text-sm text-slate-700 dark:text-zinc-300">
            <label className="block">Accepted payment methods</label>
            <div className="grid gap-2">
              {paymentMethods.map((method) => (
                <label key={method.value} className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={settings.payment.acceptedMethods.includes(method.value as PaymentMethod)}
                    onChange={() => {
                      const next = settings.payment.acceptedMethods.includes(method.value as PaymentMethod)
                        ? settings.payment.acceptedMethods.filter((item) => item !== method.value)
                        : [...settings.payment.acceptedMethods, method.value as PaymentMethod];
                      updateField("payment.acceptedMethods", next);
                    }}
                    className="h-4 w-4 rounded border-slate-300 bg-white text-cyan-600 dark:border-zinc-500 dark:bg-slate-950 dark:text-cyan-500"
                  />
                  {method.label}
                </label>
              ))}
            </div>
          </div>
          <label className="space-y-2 text-sm text-slate-700 dark:text-zinc-300">
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
          <label className="space-y-2 text-sm text-slate-700 dark:text-zinc-300">
            <span>Invoice prefix</span>
            <input
              type="text"
              value={settings.invoice.invoicePrefix}
              onChange={(e) => updateField("invoice.invoicePrefix", e.target.value)}
              className={appInput}
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700 dark:text-zinc-300">
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
          <label className="space-y-2 text-sm text-slate-700 dark:text-zinc-300 sm:col-span-2">
            <span>Invoice footer</span>
            <textarea
              value={settings.invoice.invoiceFooter ?? ""}
              onChange={(e) => updateField("invoice.invoiceFooter", e.target.value)}
              className={`${appInput} min-h-30 resize-none`}
            />
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Notifications & appearance">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700 dark:text-zinc-300">
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
          <label className="space-y-2 text-sm text-slate-700 dark:text-zinc-300">
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
          <label className="space-y-2 text-sm text-slate-700 dark:text-zinc-300">
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
          <label className="space-y-2 text-sm text-slate-700 dark:text-zinc-300">
            <span>Brand color</span>
            <input
              type="color"
              value={settings.appearance.brandColor}
              onChange={(e) => updateField("appearance.brandColor", e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-slate-950"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700 dark:text-zinc-300 sm:col-span-2">
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
      </CollapsibleSection>

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
