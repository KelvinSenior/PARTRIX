import type { PaymentMethod } from "@/types/finance";

export type RefundPolicy = "STANDARD" | "FAST" | "DELAYED";
export type InvoiceTheme = "light" | "dark" | "system";

export interface SettingsPayload {
  business: {
    name: string;
    slug: string;
    contactEmail?: string;
    phone?: string;
    address?: string;
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
}

export type SettingsDTO = SettingsPayload;
