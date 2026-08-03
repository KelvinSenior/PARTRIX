import { getBooking } from "@/services/booking";
import { listPayments } from "@/services/finance";
import { getOrganizationSettings } from "@/services/settings";
import { logActivity } from "@/services/audit";
import { requireOrganizationContext } from "@/lib/tenant";
import { formatAmount, formatDate } from "@/lib/branding";
import { createNotification } from "@/services/notification";
import type { BookingDTO } from "@/types/booking";
import type { PaymentDTO } from "@/types/finance";
import type { SettingsDTO } from "@/types/settings";

type InvoiceData = {
  booking: BookingDTO;
  payments: PaymentDTO[];
  settings: SettingsDTO;
  invoiceNumber: string;
  issuedAt: Date;
};

const pageWidth = 595;
const pageHeight = 842;
const margin = 42;

function money(value: number, settings: SettingsDTO) {
  return formatAmount(value, settings);
}

function safeText(value: unknown) {
  return String(value ?? "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdfText(value: unknown) {
  return safeText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function hexToRgb(hex: string) {
  const normalized = /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : "22D3EE";
  return {
    r: parseInt(normalized.slice(0, 2), 16) / 255,
    g: parseInt(normalized.slice(2, 4), 16) / 255,
    b: parseInt(normalized.slice(4, 6), 16) / 255,
  };
}

function text(x: number, y: number, value: unknown, size = 10, font = "F1", color = "0 0 0") {
  return `BT /${font} ${size} Tf ${color} rg ${x} ${y} Td (${escapePdfText(value)}) Tj ET\n`;
}

function rect(x: number, y: number, width: number, height: number, color: string) {
  return `${color} rg ${x} ${y} ${width} ${height} re f\n`;
}

function line(x1: number, y1: number, x2: number, y2: number, color = "0.82 0.86 0.91", width = 0.7) {
  return `${color} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S\n`;
}

function wrap(value: unknown, maxChars: number) {
  const words = safeText(value).split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function buildInvoiceNumber(settings: SettingsDTO, booking: BookingDTO) {
  const suffix = booking.bookingNumber.replace(/^BKG-/, "");
  return `${settings.invoice.invoicePrefix}-${suffix}`;
}

function addFooter(content: string, settings: SettingsDTO, invoiceNumber: string, pageNumber: number) {
  const footer = settings.invoice.invoiceFooter || "Thank you for choosing Partrix.";
  return (
    content +
    line(margin, 42, pageWidth - margin, 42, "0.88 0.91 0.95", 0.5) +
    text(margin, 25, footer, 8, "F1", "0.35 0.39 0.45") +
    text(pageWidth - 142, 25, `${invoiceNumber} / Page ${pageNumber}`, 8, "F1", "0.35 0.39 0.45")
  );
}

function buildInvoicePages(data: InvoiceData) {
  const { booking, payments, settings, invoiceNumber, issuedAt } = data;
  const brand = hexToRgb(settings.appearance.brandColor);
  const brandColor = `${brand.r.toFixed(3)} ${brand.g.toFixed(3)} ${brand.b.toFixed(3)}`;
  const ink = "0.07 0.09 0.13";
  const muted = "0.35 0.39 0.45";
  const soft = "0.96 0.97 0.98";
  const rule = "0.86 0.88 0.92";
  const paid = payments
    .filter((payment) => payment.status === "COMPLETED")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const customerName = `${booking.customer.firstName} ${booking.customer.lastName}`.trim();
  const dueDate = booking.returnDate || booking.eventDate;
  const rentalPeriod = `${formatDate(booking.eventDate, settings)} - ${booking.returnDate ? formatDate(booking.returnDate, settings) : "Open"}`;
  const paymentStatus = booking.balanceDue <= 0 ? "Paid" : paid > 0 ? "Partially paid" : "Payment due";
  const businessEmail = settings.business.businessEmail || settings.business.contactEmail || "";
  const businessPhone = settings.business.businessPhone || settings.business.phone || "";
  const businessAddress = [
    settings.business.address,
    settings.business.city,
    settings.business.stateProvince,
    settings.business.country,
    settings.business.postalCode,
  ].filter(Boolean).join(", ");
  const pages: string[] = [];

  let content = "";
  let y = pageHeight - 58;

  content += text(margin, y, settings.business.name, 18, "F2", ink);
  content += rect(margin, y - 12, 58, 3, brandColor);
  content += text(pageWidth - 148, y + 2, "INVOICE", 24, "F2", ink);
  content += rect(pageWidth - 94, y - 46, 52, 52, soft);
  content += text(pageWidth - 85, y - 17, "LOGO", 9, "F2", muted);
  content += text(margin, y - 32, businessAddress, 8, "F1", muted);
  content += text(margin, y - 46, businessPhone, 8, "F1", muted);
  content += text(margin + 138, y - 46, businessEmail, 8, "F1", muted);
  content += text(margin, y - 60, settings.business.website || "", 8, "F1", muted);
  content += line(margin, y - 78, pageWidth - margin, y - 78, rule, 0.8);

  y -= 112;
  const metaRows = [
    ["Invoice number", invoiceNumber],
    ["Booking number", booking.bookingNumber],
    ["Issue date", formatDate(issuedAt, settings)],
    ["Due date", formatDate(dueDate, settings)],
    ["Payment status", paymentStatus],
  ];

  content += text(margin, y, "Customer details", 9, "F2", brandColor);
  content += text(margin, y - 20, customerName || "Customer", 13, "F2", ink);
  content += text(margin, y - 38, booking.customer.company || "", 9, "F1", muted);
  content += text(margin, y - 54, booking.customer.email || "", 9, "F1", muted);
  content += text(margin, y - 70, booking.customer.phone || "", 9, "F1", muted);
  wrap(booking.customer.address || "", 44).slice(0, 2).forEach((lineText, index) => {
    content += text(margin, y - 86 - index * 14, lineText, 9, "F1", muted);
  });

  const metaX = 344;
  content += rect(metaX - 16, y - 116, 209, 136, "0.985 0.988 0.992");
  metaRows.forEach(([label, value], index) => {
    const rowY = y - 4 - index * 24;
    content += text(metaX, rowY, label, 8, "F2", muted);
    content += text(metaX + 88, rowY, value, 8.5, "F1", ink);
  });

  y -= 148;
  content += text(margin, y, "Rental period", 9, "F2", brandColor);
  content += text(margin + 100, y, rentalPeriod, 9, "F1", ink);
  y -= 30;
  content += text(margin, y, "Itemized rental", 11, "F2", ink);
  y -= 20;
  content += rect(margin, y - 6, pageWidth - margin * 2, 26, "0.94 0.96 0.98");
  content += text(margin + 12, y + 3, "Description", 8, "F2", ink);
  content += text(322, y + 3, "Qty", 8, "F2", ink);
  content += text(378, y + 3, "Rate", 8, "F2", ink);
  content += text(482, y + 3, "Amount", 8, "F2", ink);
  y -= 26;

  booking.bookingItems.forEach((item, index) => {
    if (y < 150) {
      pages.push(addFooter(content, settings, invoiceNumber, pages.length + 1));
      content = "";
      y = pageHeight - 78;
      content += text(margin, y, `${invoiceNumber} - continued`, 12, "F2", "0.05 0.07 0.12");
      y -= 35;
    }

    const rowHeight = 42;
    if (index % 2 === 0) content += rect(margin, y - 26, pageWidth - margin * 2, rowHeight, "0.985 0.988 0.992");
    content += text(margin + 12, y, item.inventoryItemName, 9, "F2", ink);
    if (item.notes) content += text(margin + 12, y - 14, item.notes, 8, "F1", muted);
    content += text(326, y, item.quantity, 9, "F1", ink);
    content += text(378, y, money(item.unitPrice, settings), 9, "F1", ink);
    content += text(466, y, money(item.totalPrice, settings), 9, "F2", ink);
    y -= rowHeight;
  });

  y -= 8;
  const totalsX = 344;
  const totals = [
    ["Items subtotal", booking.bookingItems.reduce((sum, item) => sum + item.totalPrice, 0)],
    ["Delivery fee", booking.deliveryFee],
    ["Setup fee", booking.setupFee],
    ["Discount", -booking.discount],
    ["Total", booking.totalAmount],
    ["Paid", paid],
    ["Balance due", booking.balanceDue],
  ];

  totals.forEach(([label, rawValue], index) => {
    const value = Number(rawValue);
    const rowY = y - index * 22;
    if (label === "Total" || label === "Balance due") {
      content += line(totalsX, rowY + 13, pageWidth - margin, rowY + 13, rule, 0.7);
    }
    content += text(totalsX, rowY, label, label === "Balance due" ? 10 : 9, "F2", label === "Balance due" ? brandColor : muted);
    content += text(466, rowY, value < 0 ? `-${money(Math.abs(value), settings)}` : money(value, settings), label === "Balance due" ? 10 : 9, "F2", ink);
  });

  const depositY = y - totals.length * 22 - 16;
  content += rect(margin, depositY - 44, 250, 62, soft);
  content += text(margin + 14, depositY, "Refundable deposit", 9, "F2", brandColor);
  content += text(margin + 14, depositY - 18, `${money(booking.depositAmount, settings)} required`, 10, "F2", ink);
  content += text(margin + 14, depositY - 34, `${money(booking.depositPaid, settings)} paid / ${booking.depositStatus.replace(/_/g, " ")}`, 8, "F1", muted);

  if (booking.notes) {
    content += text(margin, depositY - 78, "Notes", 9, "F2", ink);
    wrap(booking.notes, 95).slice(0, 3).forEach((lineText, index) => {
      content += text(margin, depositY - 96 - index * 14, lineText, 8, "F1", muted);
    });
  }

  pages.push(addFooter(content, settings, invoiceNumber, pages.length + 1));
  return pages;
}

function buildPdf(pages: string[]) {
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];
  const pageObjectIds: number[] = [];

  pages.forEach((content) => {
    const contentId = objects.length + 2;
    const pageId = objects.length + 1;
    pageObjectIds.push(pageId);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    objects.push(`<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}endstream`);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "latin1");
}

export async function getInvoiceData(bookingId: string): Promise<InvoiceData | null> {
  const [booking, settings, payments] = await Promise.all([
    getBooking(bookingId),
    getOrganizationSettings(),
    listPayments(),
  ]);

  if (!booking) return null;

  return {
    booking,
    settings,
    payments: payments.filter((payment) => payment.bookingId === booking.id),
    invoiceNumber: buildInvoiceNumber(settings, booking),
    issuedAt: new Date(),
  };
}

export function generateInvoicePdfFromData(data: InvoiceData) {
  return buildPdf(buildInvoicePages(data));
}

export async function generateInvoicePdf(bookingId: string, options?: { notify?: boolean }) {
  const data = await getInvoiceData(bookingId);
  if (!data) return null;

  if (options?.notify !== false) {
    const user = await requireOrganizationContext();
    await createNotification({
      organizationId: user.organizationId!,
      userId: user.id,
      type: "INVOICE",
      priority: data.booking.balanceDue > 0 ? "INFO" : "SUCCESS",
      title: "Invoice created",
      message: `${data.invoiceNumber} was generated for ${data.booking.bookingNumber}.`,
      href: `/api/bookings/${data.booking.id}/invoice`,
      entity: "Booking",
      entityId: data.booking.id,
      metadata: { invoiceNumber: data.invoiceNumber, balanceDue: data.booking.balanceDue },
    });
  }

  return {
    data,
    pdf: generateInvoicePdfFromData(data),
    filename: `${data.invoiceNumber}.pdf`,
  };
}

export async function sendInvoiceEmail(options: {
  bookingId: string;
  to: string;
  message?: string;
  userId?: string | null;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.INVOICE_EMAIL_FROM;

  if (!resendApiKey || !from) {
    throw new Error("Invoice email is not configured. Add RESEND_API_KEY and INVOICE_EMAIL_FROM to your environment.");
  }

  const invoice = await generateInvoicePdf(options.bookingId, { notify: false });
  if (!invoice) {
    throw new Error("Booking not found.");
  }

  const { data, pdf, filename } = invoice;
  const recipient = options.to.trim();
  if (!recipient) {
    throw new Error("Enter a recipient email address.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      subject: `Invoice ${data.invoiceNumber} for ${data.booking.bookingNumber}`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5">
          <h2 style="margin:0 0 12px">Invoice ${data.invoiceNumber}</h2>
          <p>${options.message?.trim() || `Thank you for booking with ${data.settings.business.name}. Your invoice is attached as a PDF.`}</p>
          <p><strong>Booking:</strong> ${data.booking.bookingNumber}<br/><strong>Balance due:</strong> ${money(data.booking.balanceDue, data.settings)}</p>
        </div>
      `,
      attachments: [
        {
          filename,
          type: "application/pdf",
          data: pdf.toString("base64"),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const errorMessage =
      body?.error?.message || body?.message || JSON.stringify(body) || "Invoice email could not be sent.";
    throw new Error(errorMessage);
  }

  const user = await requireOrganizationContext();
  await logActivity({
    organizationId: user.organizationId!,
    userId: options.userId ?? user.id,
    bookingId: data.booking.id,
    action: "Send invoice",
    entity: "Booking",
    entityId: data.booking.id,
    details: { invoiceNumber: data.invoiceNumber, recipient },
    level: "INFO",
  });

  await createNotification({
    organizationId: user.organizationId!,
    userId: options.userId ?? user.id,
    type: "INVOICE",
    priority: "SUCCESS",
    title: "Invoice sent",
    message: `${data.invoiceNumber} was sent to ${recipient}.`,
    href: `/bookings/${data.booking.id}`,
    entity: "Booking",
    entityId: data.booking.id,
    metadata: { invoiceNumber: data.invoiceNumber, recipient },
  });

  return { invoiceNumber: data.invoiceNumber, recipient };
}
