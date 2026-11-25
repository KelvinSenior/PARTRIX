import { describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import { defaultSettings } from "@/lib/settingsValidation";
import type { BookingDTO } from "@/types/booking";
import type { SettingsDTO } from "@/types/settings";

vi.mock("@/services/booking", () => ({ getBooking: vi.fn() }));
vi.mock("@/services/finance", () => ({ listPayments: vi.fn() }));
vi.mock("@/services/settings", () => ({ getOrganizationSettings: vi.fn() }));
vi.mock("@/services/audit", () => ({ logActivity: vi.fn() }));
vi.mock("@/lib/permissions", () => ({ requirePermission: vi.fn() }));
vi.mock("@/services/notification", () => ({ createNotification: vi.fn() }));

import { generateInvoicePdfFromData, type InvoiceData } from "@/services/invoice";

const booking: BookingDTO = {
  id: "booking-id",
  bookingNumber: "BKG-1",
  customer: {
    id: "customer-id",
    firstName: "Taylor",
    lastName: "User",
    email: null,
    phone: null,
    company: null,
    address: null,
  },
  eventDate: "2026-12-01T00:00:00.000Z",
  deliveryDate: null,
  returnDate: "2026-12-01T00:00:00.000Z",
  status: "CONFIRMED",
  notes: null,
  deliveryFee: 0,
  setupFee: 0,
  discount: 15,
  totalAmount: 165,
  depositAmount: 0,
  depositPaid: 0,
  depositRefunded: 0,
  depositOutstanding: 0,
  depositStatus: "PENDING",
  refundStatus: "NONE",
  balanceDue: 165,
  bookingItems: [
    {
      id: "booking-item-a",
      inventoryItemId: "item-a",
      inventoryItemName: "Chair",
      quantity: 1,
      unitPrice: 100,
      discount: 10,
      totalPrice: 90,
      returnedQuantity: 0,
      notes: null,
    },
    {
      id: "booking-item-b",
      inventoryItemId: "item-b",
      inventoryItemName: "Table",
      quantity: 1,
      unitPrice: 100,
      discount: 10,
      totalPrice: 90,
      returnedQuantity: 0,
      notes: null,
    },
  ],
  createdAt: "2026-11-24T00:00:00.000Z",
  updatedAt: "2026-11-24T00:00:00.000Z",
};

describe("booking invoice PDF", () => {
  it("shows the gross item subtotal and combined item and booking discounts", async () => {
    const invoice: InvoiceData = {
      booking,
      payments: [],
      settings: defaultSettings as unknown as SettingsDTO,
      invoiceNumber: "INV-1",
      issuedAt: new Date("2026-11-24T00:00:00.000Z"),
    };

    const pdfText = (await generateInvoicePdfFromData(invoice)).toString("latin1");

    expect(pdfText).toContain("(Items subtotal)");
    expect(pdfText).toContain("($200.00)");
    expect(pdfText).toContain("(Discount)");
    expect(pdfText).toContain("(-$35.00)");
    expect(pdfText).toContain("(Total)");
    expect(pdfText).toContain("($165.00)");
  });

  it("embeds an uploaded logo in the PDF instead of showing the placeholder", async () => {
    const logo = await sharp({
      create: {
        width: 2,
        height: 2,
        channels: 3,
        background: { r: 20, g: 120, b: 200 },
      },
    }).png().toBuffer();
    const invoice: InvoiceData = {
      booking,
      payments: [],
      settings: {
        ...defaultSettings,
        business: {
          ...defaultSettings.business,
          logoData: `data:image/png;base64,${logo.toString("base64")}`,
        },
      } as unknown as SettingsDTO,
      invoiceNumber: "INV-1",
      issuedAt: new Date("2026-11-24T00:00:00.000Z"),
    };

    const pdfText = (await generateInvoicePdfFromData(invoice)).toString("latin1");

    expect(pdfText).toContain("/Subtype /Image");
    expect(pdfText).toContain("/DCTDecode");
    expect(pdfText).toContain("/Logo Do");
    expect(pdfText).not.toContain("(LOGO)");
  });

  it("supports SVG logos uploaded through workspace settings", async () => {
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2" fill="#1478c8"/></svg>',
    );
    const invoice: InvoiceData = {
      booking,
      payments: [],
      settings: {
        ...defaultSettings,
        business: {
          ...defaultSettings.business,
          logoData: `data:image/svg+xml;base64,${svg.toString("base64")}`,
        },
      } as unknown as SettingsDTO,
      invoiceNumber: "INV-1",
      issuedAt: new Date("2026-11-24T00:00:00.000Z"),
    };

    const pdfText = (await generateInvoicePdfFromData(invoice)).toString("latin1");

    expect(pdfText).toContain("/Subtype /Image");
    expect(pdfText).not.toContain("(LOGO)");
  });
});
