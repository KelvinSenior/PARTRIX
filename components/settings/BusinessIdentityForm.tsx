"use client";

import { useMemo, useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { currencyOptions, dateFormatOptions, defaultCurrencyConfig, defaultDateFormat, timeZoneOptions } from "@/lib/branding";
import type { SettingsDTO } from "@/types/settings";

const inputClass = "w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

export default function BusinessIdentityForm({
  settings,
  onChange,
  onSave,
  saving,
  error,
  success,
}: {
  settings: SettingsDTO;
  onChange: (value: SettingsDTO) => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
  success: string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filteredCurrencies = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return currencyOptions;
    return currencyOptions.filter((option) => `${option.name} ${option.isoCode} ${option.symbol}`.toLowerCase().includes(value));
  }, [query]);

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/settings/logo", {
        method: "POST",
        body: formData,
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || "Logo upload failed.");
      const next = {
        ...settings,
        business: {
          ...settings.business,
          logoData: body.logoUrl,
          logoUrl: body.logoUrl,
        },
      } as SettingsDTO;
      onChange(next);
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function removeLogo() {
    setUploadError(null);
    setUploading(true);
    try {
      const response = await fetch("/api/settings/logo", { method: "DELETE" });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || "Logo removal failed.");
      const next = {
        ...settings,
        business: {
          ...settings.business,
          logoData: "",
          logoUrl: "",
        },
      } as SettingsDTO;
      onChange(next);
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_10px_34px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-950/50 dark:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Business identity</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Customize how your business appears in invoices, reports, and customer-facing documents.</p>
        </div>
        <button type="button" onClick={onSave} disabled={saving} className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/80 dark:border-zinc-700 dark:bg-zinc-950/80">
            {settings.business.logoData || settings.business.logoUrl ? (
              <img src={settings.business.logoData || settings.business.logoUrl} alt="Business logo preview" className="h-full w-full rounded-2xl object-contain p-2" />
            ) : (
              <div className="text-center text-sm text-slate-500 dark:text-zinc-400">
                <ImageIcon className="mx-auto mb-2 h-8 w-8" />
                <p>No logo yet</p>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Upload logo"}
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml" className="sr-only" onChange={handleLogoUpload} />
            </label>
            <button type="button" onClick={removeLogo} disabled={!settings.business.logoData && !settings.business.logoUrl} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-400/30 dark:text-rose-200 dark:hover:bg-rose-400/10">
              <X className="h-4 w-4" /> Remove logo
            </button>
          </div>
          {uploadError ? <p className="mt-3 text-sm text-rose-600">{uploadError}</p> : null}
          <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400">PNG, JPG, JPEG, or SVG up to 5 MB. A 512×512+ image is recommended.</p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-zinc-300">
              <span>Company name</span>
              <input value={settings.business.name} onChange={(event) => onChange({ ...settings, business: { ...settings.business, name: event.target.value } })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-zinc-300">
              <span>Business email</span>
              <input type="email" value={settings.business.businessEmail ?? ""} onChange={(event) => onChange({ ...settings, business: { ...settings.business, businessEmail: event.target.value } })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-zinc-300">
              <span>Phone number</span>
              <input value={settings.business.businessPhone ?? ""} onChange={(event) => onChange({ ...settings, business: { ...settings.business, businessPhone: event.target.value } })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-zinc-300">
              <span>Website</span>
              <input value={settings.business.website ?? ""} onChange={(event) => onChange({ ...settings, business: { ...settings.business, website: event.target.value } })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-zinc-300 md:col-span-2">
              <span>Business address</span>
              <input value={settings.business.address ?? ""} onChange={(event) => onChange({ ...settings, business: { ...settings.business, address: event.target.value } })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-zinc-300">
              <span>City</span>
              <input value={settings.business.city ?? ""} onChange={(event) => onChange({ ...settings, business: { ...settings.business, city: event.target.value } })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-zinc-300">
              <span>State / Province</span>
              <input value={settings.business.stateProvince ?? ""} onChange={(event) => onChange({ ...settings, business: { ...settings.business, stateProvince: event.target.value } })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-zinc-300">
              <span>Country</span>
              <input value={settings.business.country ?? ""} onChange={(event) => onChange({ ...settings, business: { ...settings.business, country: event.target.value } })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-zinc-300">
              <span>Postal code</span>
              <input value={settings.business.postalCode ?? ""} onChange={(event) => onChange({ ...settings, business: { ...settings.business, postalCode: event.target.value } })} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-zinc-300 md:col-span-2">
              <span>Tax / VAT ID</span>
              <input value={settings.business.taxId ?? ""} onChange={(event) => onChange({ ...settings, business: { ...settings.business, taxId: event.target.value } })} className={inputClass} />
            </label>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Live preview</h4>
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-zinc-400">Business identity</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{settings.business.name || "Your business"}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">{[settings.business.address, settings.business.city, settings.business.country].filter(Boolean).join(", ") || "Your address"}</p>
                </div>
                {settings.business.logoData || settings.business.logoUrl ? (
                  <img src={settings.business.logoData || settings.business.logoUrl} alt="Preview logo" className="h-16 w-16 rounded-2xl object-contain" />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Currency</label>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search currency" className={inputClass} />
          <select value={settings.localization.currency.isoCode} onChange={(event) => {
            const selected = currencyOptions.find((option) => option.isoCode === event.target.value) ?? defaultCurrencyConfig;
            onChange({ ...settings, localization: { ...settings.localization, currency: { ...settings.localization.currency, ...selected, isoCode: selected.isoCode, name: selected.name, symbol: selected.symbol, locale: selected.locale } } });
          }} className={inputClass}>
            {filteredCurrencies.map((option) => (
              <option key={option.isoCode} value={option.isoCode}>{option.name} ({option.isoCode})</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Symbol position</label>
          <select value={settings.localization.currency.symbolPosition} onChange={(event) => onChange({ ...settings, localization: { ...settings.localization, currency: { ...settings.localization.currency, symbolPosition: event.target.value as "before" | "after" } } })} className={inputClass}>
            <option value="before">Before amount</option>
            <option value="after">After amount</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Decimal places</label>
          <input type="number" min="0" max="6" value={settings.localization.currency.decimalPlaces} onChange={(event) => onChange({ ...settings, localization: { ...settings.localization, currency: { ...settings.localization.currency, decimalPlaces: Number(event.target.value) } } })} className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Decimal separator</label>
          <input value={settings.localization.currency.decimalSeparator} onChange={(event) => onChange({ ...settings, localization: { ...settings.localization, currency: { ...settings.localization.currency, decimalSeparator: event.target.value } } })} className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Thousands separator</label>
          <input value={settings.localization.currency.thousandsSeparator} onChange={(event) => onChange({ ...settings, localization: { ...settings.localization, currency: { ...settings.localization.currency, thousandsSeparator: event.target.value } } })} className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Locale</label>
          <input value={settings.localization.currency.locale} onChange={(event) => onChange({ ...settings, localization: { ...settings.localization, currency: { ...settings.localization.currency, locale: event.target.value } } })} className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Time zone</label>
          <select value={settings.localization.timeZone} onChange={(event) => onChange({ ...settings, localization: { ...settings.localization, timeZone: event.target.value } })} className={inputClass}>
            {timeZoneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Date format</label>
          <select value={settings.localization.dateFormat} onChange={(event) => onChange({ ...settings, localization: { ...settings.localization, dateFormat: event.target.value as SettingsDTO["localization"]["dateFormat"] } })} className={inputClass}>
            {dateFormatOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      </div>

      {error ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">{error}</p> : null}
      {success ? <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">{success}</p> : null}
    </div>
  );
}
