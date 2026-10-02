import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { logActivity } from "@/services/audit";
import { getOrganizationSettings } from "@/services/settings";
import { createNotification } from "@/services/notification";
import { formatAmount } from "@/lib/branding";
import { expensePayloadSchema, paymentPayloadSchema } from "@/lib/financeValidation";
import { InvalidOperationError, NotFoundError } from "@/lib/domainErrors";
import type { PaymentPayload, PaymentDTO, ExpensePayload, ExpenseDTO, FinanceSummary } from "@/types/finance";

function decimalToNumber(value: any): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && "toNumber" in value) return Number(value.toNumber());
  return Number(value.toString());
}

function toCents(value: number | string | { toString: () => string }): number {
  const normalized = typeof value === "object" ? value.toString() : String(value);
  const match = normalized.match(/^(-?)(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) throw new InvalidOperationError("Monetary values must have at most two decimal places.");
  const cents = Number(match[2]) * 100 + Number((match[3] ?? "").padEnd(2, "0"));
  return match[1] ? -cents : cents;
}

function centsToDecimal(cents: number) {
  return (cents / 100).toFixed(2);
}

export async function recordPayment(payload: PaymentPayload, processedById?: string | null): Promise<PaymentDTO> {
  payload = paymentPayloadSchema.parse(payload);
  const user = await requirePermission(payload.type === "REFUND" ? "finance:refund" : "finance:record");
  const settings = await getOrganizationSettings();

  if (!settings.payment.acceptedMethods.includes(payload.method)) {
    throw new InvalidOperationError("This payment method is not enabled in workspace settings.");
  }

  if (settings.payment.requireTransactionReference && !payload.transactionReference?.trim()) {
    throw new InvalidOperationError("Transaction reference is required by workspace settings.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const now = new Date();
    const paymentType = payload.type ?? "RENTAL";
    const booking = payload.bookingId
      ? await tx.booking.findFirst({ where: { id: payload.bookingId, organizationId: user.organizationId! } })
      : null;
    if (payload.bookingId && !booking) {
      throw new NotFoundError("Booking not found.");
    }
    if (paymentType === "REFUND" && !booking) {
      throw new NotFoundError("Booking not found.");
    }

    const amountCents = toCents(payload.amount);
    if (booking) {
      const depositPaidCents = toCents(booking.depositPaid);
      const depositRefundedCents = toCents(booking.depositRefunded);
      if (paymentType === "REFUND" && amountCents > depositPaidCents - depositRefundedCents) {
        throw new InvalidOperationError("Refund exceeds the refundable deposit balance.");
      }
    }

    const payment = await tx.payment.create({
      data: {
        organizationId: user.organizationId!,
        bookingId: payload.bookingId ?? null,
        amount: payload.amount.toString(),
        method: payload.method as any,
        type: paymentType as any,
        status: paymentType === "REFUND" ? "REFUNDED" : "COMPLETED",
        transactionReference: payload.transactionReference?.trim() || null,
        processedById: processedById ?? null,
        processedAt: now,
        notes: payload.notes ?? null,
      } as any,
      include: { booking: { include: { customer: true } } },
    });

    // If this payment is tied to a booking, update booking financial fields.
    if (payment.bookingId) {
      if (booking) {
        const totalAmountCents = toCents(booking.totalAmount);
        const depositAmountCents = toCents(booking.depositAmount);
        const existingDepositPaidCents = toCents(booking.depositPaid);
        const existingDepositRefundedCents = toCents(booking.depositRefunded);
        const existingBalanceDueCents = toCents(booking.balanceDue);
        const depositOutstandingBefore = Math.max(0, depositAmountCents - existingDepositPaidCents);
        const rentalOutstandingBefore = Math.max(0, existingBalanceDueCents - depositOutstandingBefore);
        const rentalPaidBefore = Math.max(0, totalAmountCents - rentalOutstandingBefore);

        if (payment.type === "SECURITY_DEPOSIT") {
          const depositAllocation = Math.min(amountCents, depositOutstandingBefore);
          const nextDepositPaidCents = existingDepositPaidCents + depositAllocation;
          const depositStatus = nextDepositPaidCents >= depositAmountCents ? "PAID" : "PENDING";
          const remainingBalanceCents = Math.max(0, rentalOutstandingBefore + depositAmountCents - nextDepositPaidCents);

          await tx.booking.update({
            where: { id: booking.id },
            data: {
              depositPaid: centsToDecimal(nextDepositPaidCents),
              depositStatus,
              balanceDue: centsToDecimal(remainingBalanceCents),
            } as any,
          });
        } else if (payment.type === "REFUND") {
          const refundableCents = Math.max(0, existingDepositPaidCents - existingDepositRefundedCents);
          const nextDepositRefundedCents = existingDepositRefundedCents + Math.min(refundableCents, amountCents);
          const refundStatus = nextDepositRefundedCents >= depositAmountCents ? "APPROVED" : "PARTIAL";
          const remainingBalanceCents = rentalOutstandingBefore + depositOutstandingBefore;
          await tx.booking.update({
            where: { id: booking.id },
            data: {
              depositRefunded: centsToDecimal(nextDepositRefundedCents),
              depositStatus: nextDepositRefundedCents >= depositAmountCents ? "REFUNDED" : "PARTIALLY_REFUNDED",
              refundStatus,
              balanceDue: centsToDecimal(remainingBalanceCents),
            } as any,
          });
        } else {
          const rentalAllocation = Math.min(amountCents, Math.max(0, totalAmountCents - rentalPaidBefore));
          const remaining = Math.max(0, amountCents - rentalAllocation);
          const depositAllocation = Math.min(remaining, depositOutstandingBefore);
          const nextDepositPaidCents = existingDepositPaidCents + depositAllocation;
          const nextRentalPaid = rentalPaidBefore + rentalAllocation;
          const nextDepositOutstanding = Math.max(0, depositAmountCents - nextDepositPaidCents);
          const nextRentalOutstanding = Math.max(0, totalAmountCents - nextRentalPaid);
          const nextBalanceDue = nextRentalOutstanding + nextDepositOutstanding;

          await tx.booking.update({
            where: { id: booking.id },
            data: {
              depositPaid: centsToDecimal(nextDepositPaidCents),
              depositStatus: nextDepositOutstanding > 0 ? "PENDING" : "PAID",
              balanceDue: centsToDecimal(nextBalanceDue),
            } as any,
          });
        }
      }

      await logActivity({
        tx,
        organizationId: user.organizationId!,
        userId: processedById ?? null,
        bookingId: payment.bookingId,
        action: "Record payment",
        entity: "Payment",
        entityId: payment.id,
        details: {
          amount: decimalToNumber(payment.amount),
          type: payment.type,
          method: payment.method,
          bookingId: payment.bookingId,
        },
        level: "INFO",
      });

    }

    return {
      id: payment.id,
      bookingId: payment.bookingId ?? null,
      bookingNumber: (payment as any).booking?.bookingNumber ?? null,
      amount: decimalToNumber(payment.amount),
      type: payment.type as any,
      method: payment.method as any,
      status: payment.status,
      transactionReference: payment.transactionReference ?? null,
      processedById: payment.processedById ?? null,
      processedAt: payment.processedAt ? payment.processedAt.toISOString() : null,
      notes: payment.notes ?? null,
      createdAt: payment.createdAt.toISOString(),
    };
  });

  if (result.bookingId) {
    await createNotification({
      organizationId: user.organizationId!,
      userId: processedById ?? user.id,
      type: "PAYMENT",
      priority: result.type === "REFUND" ? "INFO" : "SUCCESS",
      title: result.type === "REFUND" ? "Refund recorded" : "Payment received",
      message: `${result.type.replace(/_/g, " ")} of ${formatAmount(result.amount, settings)} was recorded.`,
      href: `/bookings/${result.bookingId}`,
      entity: "Payment",
      entityId: result.id,
      metadata: { amount: result.amount, method: result.method, paymentType: result.type },
    });
  }

  return result;
}

export async function listPayments(start?: Date, end?: Date) {
  const user = await requirePermission("finance:read");
  const where: any = { organizationId: user.organizationId! };
  if (start || end) where.processedAt = {};
  if (start) where.processedAt.gte = start;
  if (end) where.processedAt.lte = end;

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { processedAt: "desc" },
    take: 200,
    include: { booking: { include: { customer: true } } },
  });

  return payments.map((p) => ({
    id: p.id,
    bookingId: p.bookingId ?? null,
    bookingNumber: p.booking?.bookingNumber ?? null,
    customerName: p.booking?.customer ? `${p.booking.customer.firstName} ${p.booking.customer.lastName}` : null,
    amount: decimalToNumber(p.amount),
    type: p.type as any,
    method: p.method as any,
    status: p.status,
    transactionReference: p.transactionReference ?? null,
    processedById: p.processedById ?? null,
    processedAt: p.processedAt ? p.processedAt.toISOString() : null,
    notes: p.notes ?? null,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function recordExpense(payload: ExpensePayload, createdById?: string | null): Promise<ExpenseDTO> {
  payload = expensePayloadSchema.parse(payload);
  const user = await requirePermission("expenses:record");
  const expense = await prisma.$transaction(async (tx) => {
    if (payload.bookingId) {
      const booking = await tx.booking.findFirst({
        where: { id: payload.bookingId, organizationId: user.organizationId! },
        select: { id: true },
      });
      if (!booking) throw new NotFoundError("Booking not found.");
    }
    return tx.expense.create({
      data: {
        organizationId: user.organizationId!,
        category: payload.category as any,
        amount: payload.amount.toFixed(2),
        incurredAt: new Date(payload.incurredAt),
        vendor: payload.vendor ?? null,
        receiptUrl: payload.receiptUrl ?? null,
        bookingId: payload.bookingId ?? null,
        createdById: createdById ?? null,
        notes: payload.notes ?? null,
      } as any,
    });
  });

  await logActivity({
    organizationId: user.organizationId!,
    userId: createdById ?? null,
    bookingId: payload.bookingId ?? null,
    action: "Record expense",
    entity: "Expense",
    entityId: expense.id,
    details: {
      category: expense.category,
      amount: decimalToNumber(expense.amount),
      vendor: expense.vendor,
      bookingId: expense.bookingId,
    },
    level: "INFO",
  });

  return {
    id: expense.id,
    category: expense.category,
    amount: decimalToNumber(expense.amount),
    incurredAt: expense.incurredAt.toISOString(),
    vendor: expense.vendor ?? null,
    receiptUrl: expense.receiptUrl ?? null,
    bookingId: expense.bookingId ?? null,
    createdById: expense.createdById ?? null,
    notes: expense.notes ?? null,
    createdAt: expense.createdAt.toISOString(),
  };
}

export async function listExpenses(start?: Date, end?: Date) {
  const user = await requirePermission("expenses:read");
  const where: any = { organizationId: user.organizationId! };
  if (start || end) where.incurredAt = {};
  if (start) where.incurredAt.gte = start;
  if (end) where.incurredAt.lte = end;

  const results = await prisma.expense.findMany({ where, orderBy: { incurredAt: "desc" }, take: 200 });

  return results.map((e) => ({
    id: e.id,
    category: e.category,
    amount: decimalToNumber(e.amount),
    incurredAt: e.incurredAt.toISOString(),
    vendor: e.vendor ?? null,
    receiptUrl: e.receiptUrl ?? null,
    bookingId: e.bookingId ?? null,
    createdById: e.createdById ?? null,
    notes: e.notes ?? null,
    createdAt: e.createdAt.toISOString(),
  }));
}

export async function getFinanceSummary(start?: Date, end?: Date): Promise<FinanceSummary> {
  const user = await requirePermission("finance:read");
  const where = { organizationId: user.organizationId! };
  const payments = await prisma.payment.findMany({ where: { ...where, status: "COMPLETED", type: "RENTAL", processedAt: { gte: start ?? new Date(0), lte: end ?? new Date() } } as any });
  const expenses = await prisma.expense.findMany({ where: { ...where, incurredAt: { gte: start ?? new Date(0), lte: end ?? new Date() } } as any });

  const revenue = payments.reduce((s, p) => s + decimalToNumber(p.amount), 0);
  const expenseTotal = expenses.reduce((s, e) => s + decimalToNumber(e.amount), 0);
  const profit = revenue - expenseTotal;

  // outstanding - sum of booking.balanceDue > 0
  const outstandingBookings = await prisma.booking.findMany({ where: { ...where, balanceDue: { gt: 0 } as any } as any, select: { balanceDue: true } as any });
  const outstanding = outstandingBookings.reduce((s, b) => s + decimalToNumber(b.balanceDue), 0);

  // monthly analytics: naive grouping by YYYY-MM
  const monthsMap: Record<string, { revenue: number; expenses: number }> = {};

  for (const p of payments) {
    const key = p.processedAt ? new Date(p.processedAt).toISOString().slice(0, 7) : "unknown";
    monthsMap[key] = monthsMap[key] || { revenue: 0, expenses: 0 };
    monthsMap[key].revenue += decimalToNumber(p.amount);
  }

  for (const e of expenses) {
    const key = e.incurredAt ? new Date(e.incurredAt).toISOString().slice(0, 7) : "unknown";
    monthsMap[key] = monthsMap[key] || { revenue: 0, expenses: 0 };
    monthsMap[key].expenses += decimalToNumber(e.amount);
  }

  const monthly = Object.entries(monthsMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, v]) => ({ month, revenue: v.revenue, expenses: v.expenses, profit: v.revenue - v.expenses }));

  return {
    totals: { revenue, expenses: expenseTotal, profit, outstanding },
    monthly,
  };
}

export async function getCustomerDebts(): Promise<Array<{ customerId: string; customerName: string; email: string | null; outstanding: number }>> {
  const user = await requirePermission("finance:read");
  const bookings = await prisma.booking.findMany({ where: { organizationId: user.organizationId!, balanceDue: { gt: 0 } as any }, include: { customer: true } as any }) as any[];
  const map: Record<string, { customerId: string; customerName: string; email: string | null; outstanding: number }> = {};

  for (const b of bookings) {
    const cid = b.customer.id as string;
    const name = `${b.customer.firstName} ${b.customer.lastName}`;
    map[cid] = map[cid] || { customerId: cid, customerName: name, email: b.customer.email ?? null, outstanding: 0 };
    map[cid].outstanding += decimalToNumber(b.balanceDue);
  }

  return Object.values(map);
}
