import { z } from "zod";
import type { PaymentMethod } from "@/types/finance";

const paymentMethods = ["CASH", "CREDIT_CARD", "BANK_TRANSFER", "CHECK", "MOBILE_WALLET"] as const;
const optionalTrimmedString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);
const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().email("Enter a valid email address.").optional(),
);
const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().url("Enter a valid URL.").optional(),
);

export const settingsSchema = z.object({
  business: z.object({
    name: z.string().trim().min(1, "Business name is required."),
    slug: z
      .string()
      .trim()
      .min(1, "Workspace slug is required.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
    contactEmail: optionalEmail,
    phone: optionalTrimmedString,
    address: optionalTrimmedString,
  }),
  rental: z.object({
    defaultRentalTermDays: z
      .number()
      .int("Default term must be a whole number.")
      .min(1, "Default rental term must be at least 1 day."),
    allowPartialReturns: z.boolean(),
  }),
  deposit: z.object({
    requiredDepositPercent: z
      .number()
      .min(0, "Deposit percent cannot be negative.")
      .max(100, "Deposit percent cannot exceed 100."),
    holdPeriodDays: z
      .number()
      .int("Hold period must be a whole number.")
      .min(0, "Hold period cannot be negative."),
    refundPolicy: z.enum(["STANDARD", "FAST", "DELAYED"]),
  }),
  invoice: z.object({
    invoicePrefix: z.string().trim().min(1, "Invoice prefix is required."),
    invoiceFooter: optionalTrimmedString,
    emailInvoices: z.boolean(),
  }),
  payment: z.object({
    acceptedMethods: z.array(z.enum(paymentMethods)).nonempty("At least one payment method must be accepted."),
    requireTransactionReference: z.boolean(),
  }),
  notifications: z.object({
    bookingReminders: z.boolean(),
    lowInventoryAlerts: z.boolean(),
    paymentReceipts: z.boolean(),
  }),
  appearance: z.object({
    brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Enter a valid brand color."),
    theme: z.enum(["light", "dark", "system"]),
    logoUrl: optionalUrl,
  }),
});

export const defaultSettings = {
  business: {
    name: "Your Partrix Workspace",
    slug: "your-workspace",
    contactEmail: "",
    phone: "",
    address: "",
  },
  rental: {
    defaultRentalTermDays: 7,
    allowPartialReturns: true,
  },
  deposit: {
    requiredDepositPercent: 25,
    holdPeriodDays: 14,
    refundPolicy: "STANDARD",
  },
  invoice: {
    invoicePrefix: "INV",
    invoiceFooter: "Thank you for choosing Partrix.",
    emailInvoices: false,
  },
  payment: {
    acceptedMethods: ["CASH", "CREDIT_CARD", "BANK_TRANSFER", "CHECK", "MOBILE_WALLET"] as unknown as PaymentMethod[],
    requireTransactionReference: true,
  },
  notifications: {
    bookingReminders: true,
    lowInventoryAlerts: true,
    paymentReceipts: true,
  },
  appearance: {
    brandColor: "#22D3EE",
    theme: "dark",
    logoUrl: "",
  },
} as const;
