import type { PaymentMethod } from "@/types/finance";

export type RefundPolicy = "STANDARD" | "FAST" | "DELAYED";
export type InvoiceTheme = "light" | "dark" | "system";
export type DateFormatOption = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
export type CurrencySymbolPosition = "before" | "after";

export interface SettingsPayload {
  business: {
    name: string;
    slug: string;
    contactEmail?: string;
    businessEmail?: string;
    phone?: string;
    businessPhone?: string;
    address?: string;
    city?: string;
    stateProvince?: string;
    country?: string;
    postalCode?: string;
    website?: string;
    taxId?: string;
    logoUrl?: string;
    logoData?: string;
  };
  rental: {
    defaultRentalTermDays: number;
    allowPartialReturns: boolean;
  };
  deposit: {
    requiredDepositPercent: number;
    holdPeriodDays: number;
    refundPolicy: RefundPolicy;
  };
  invoice: {
    invoicePrefix: string;
    invoiceFooter?: string;
    emailInvoices: boolean;
  };
  payment: {
    acceptedMethods: PaymentMethod[];
    requireTransactionReference: boolean;
  };
  notifications: {
    bookingReminders: boolean;
    lowInventoryAlerts: boolean;
    paymentReceipts: boolean;
  };
  appearance: {
    brandColor: string;
    theme: InvoiceTheme;
    logoUrl?: string;
  };
  localization: {
    currency: {
      name: string;
      isoCode: string;
      symbol: string;
      symbolPosition: CurrencySymbolPosition;
      decimalPlaces: number;
      decimalSeparator: string;
      thousandsSeparator: string;
      locale: string;
    };
    timeZone: string;
    dateFormat: DateFormatOption;
  };
}

export type SettingsDTO = SettingsPayload;
