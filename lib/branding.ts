import type { SettingsDTO } from "@/types/settings";

export type CurrencyOption = {
  name: string;
  isoCode: string;
  symbol: string;
  locale: string;
  example: string;
};

export const currencyOptions: CurrencyOption[] = [
  { name: "US Dollar", isoCode: "USD", symbol: "$", locale: "en-US", example: "$1,234.56" },
  { name: "Euro", isoCode: "EUR", symbol: "€", locale: "de-DE", example: "€1.234,56" },
  { name: "British Pound", isoCode: "GBP", symbol: "£", locale: "en-GB", example: "£1,234.56" },
  { name: "Ghanaian Cedi", isoCode: "GHS", symbol: "GH₵", locale: "en-GH", example: "GH₵1,234.56" },
  { name: "Nigerian Naira", isoCode: "NGN", symbol: "₦", locale: "en-NG", example: "₦1,234.56" },
  { name: "South African Rand", isoCode: "ZAR", symbol: "R", locale: "en-ZA", example: "R1,234.56" },
  { name: "Kenyan Shilling", isoCode: "KES", symbol: "KSh", locale: "en-KE", example: "KSh1,234.56" },
  { name: "Indian Rupee", isoCode: "INR", symbol: "₹", locale: "en-IN", example: "₹1,234.56" },
  { name: "Canadian Dollar", isoCode: "CAD", symbol: "C$", locale: "en-CA", example: "C$1,234.56" },
  { name: "Australian Dollar", isoCode: "AUD", symbol: "A$", locale: "en-AU", example: "A$1,234.56" },
  { name: "Swiss Franc", isoCode: "CHF", symbol: "CHF", locale: "de-CH", example: "CHF1'234.56" },
  { name: "Japanese Yen", isoCode: "JPY", symbol: "¥", locale: "ja-JP", example: "¥1,234" },
  { name: "Singapore Dollar", isoCode: "SGD", symbol: "S$", locale: "en-SG", example: "S$1,234.56" },
  { name: "United Arab Emirates Dirham", isoCode: "AED", symbol: "د.إ", locale: "ar-AE", example: "د.إ1,234.56" },
  { name: "Saudi Riyal", isoCode: "SAR", symbol: "ر.س", locale: "ar-SA", example: "ر.س1,234.56" },
];

export const defaultCurrencyConfig = {
  name: "US Dollar",
  isoCode: "USD",
  symbol: "$",
  symbolPosition: "before" as const,
  decimalPlaces: 2,
  decimalSeparator: ".",
  thousandsSeparator: ",",
  locale: "en-US",
};

export const defaultDateFormat = "DD/MM/YYYY";
export const defaultTimeZone = "UTC";
export const dateFormatOptions = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] as const;
export const timeZoneOptions = [
  { value: "UTC", label: "(UTC+00:00) UTC" },
  { value: "Africa/Accra", label: "(UTC+00:00) Accra" },
  { value: "Europe/London", label: "(UTC+00:00) London" },
  { value: "Europe/Paris", label: "(UTC+01:00) Paris" },
  { value: "America/New_York", label: "(UTC-05:00) New York" },
  { value: "America/Los_Angeles", label: "(UTC-08:00) Los Angeles" },
];

function safeNumber(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function formatAmount(value: number, settings?: Partial<SettingsDTO> | null) {
  const currency = settings?.localization?.currency ?? defaultCurrencyConfig;
  const amount = safeNumber(value);
  const sign = amount < 0 ? "-" : "";
  const absolute = Math.abs(amount);
  const fixedValue = absolute.toFixed(currency.decimalPlaces ?? 2);
  const [wholePart, fractionalPart] = fixedValue.split(".");
  const groupedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator ?? ",");
  const decimalText = currency.decimalPlaces && currency.decimalPlaces > 0
    ? `${currency.decimalSeparator ?? "."}${fractionalPart ?? ""}`
    : "";
  const numberText = `${groupedWhole}${decimalText}`;
  const symbol = currency.symbol ?? currency.isoCode ?? "$";
  return currency.symbolPosition === "after"
    ? `${sign}${numberText}${symbol}`
    : `${sign}${symbol}${numberText}`;
}

export function formatDate(value: string | Date | null | undefined, settings?: Partial<SettingsDTO> | null) {
  if (!value) return "";
  const dateValue = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dateValue.getTime())) return "";
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getDate()).padStart(2, "0");
  const format = settings?.localization?.dateFormat ?? defaultDateFormat;
  switch (format) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

export function getBusinessIdentity(settings?: Partial<SettingsDTO> | null) {
  const business = settings?.business ?? {};
  const addressLines = [business.address, business.city, business.stateProvince, business.postalCode, business.country]
    .filter(Boolean)
    .join(", ");

  return {
    name: business.name || "Your business",
    logo: business.logoData || business.logoUrl || "",
    addressLines,
    phone: business.phone || business.businessPhone || "",
    email: business.businessEmail || business.contactEmail || "",
    website: business.website || "",
    taxId: business.taxId || "",
  };
}
