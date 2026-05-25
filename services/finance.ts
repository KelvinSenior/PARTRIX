import { prisma } from "@/lib/prisma";
import type { PaymentPayload, PaymentDTO, ExpensePayload, ExpenseDTO, FinanceSummary } from "@/types/finance";

function decimalToNumber(value: any): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && "toNumber" in value) return Number(value.toNumber());
  return Number(value.toString());
}

export async function recordPayment(payload: PaymentPayload, processedById?: string | null): Promise<PaymentDTO> {
  return prisma.$transaction(async (tx) => {
    const now = new Date();

    const payment = await tx.payment.create({
      data: {
        bookingId: payload.bookingId ?? null,
        amount: payload.amount.toString(),
        method: payload.method as any,
        status: "COMPLETED",
        transactionReference: payload.transactionReference ?? null,
        processedById: processedById ?? null,
        processedAt: now,
        notes: payload.notes ?? null,
      } as any,
    });

    // If this payment is tied to a booking, reduce its balanceDue
    if (payment.bookingId) {
      const booking = await tx.booking.findUnique({ where: { id: payment.bookingId } });
      if (booking) {
        const current = decimalToNumber(booking.balanceDue);
        const next = Math.max(0, current - decimalToNumber(payment.amount));
        await tx.booking.update({ where: { id: booking.id }, data: { balanceDue: next.toFixed(2) } as any });
      }
    }

    return {
      id: payment.id,
      bookingId: payment.bookingId ?? null,
      amount: decimalToNumber(payment.amount),
      method: payment.method as any,
      status: payment.status,
      transactionReference: payment.transactionReference ?? null,
      processedById: payment.processedById ?? null,
      processedAt: payment.processedAt ? payment.processedAt.toISOString() : null,
      notes: payment.notes ?? null,
      createdAt: payment.createdAt.toISOString(),
    };
  });
}

export async function listPayments(start?: Date, end?: Date) {
  const where: any = {};
  if (start || end) where.processedAt = {};
  if (start) where.processedAt.gte = start;
  if (end) where.processedAt.lte = end;

  const payments = await prisma.payment.findMany({ where, orderBy: { processedAt: "desc" }, take: 200 });

  return payments.map((p) => ({
    id: p.id,
    bookingId: p.bookingId ?? null,
    amount: decimalToNumber(p.amount),
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
  const expense = await prisma.expense.create({
    data: {
      category: payload.category as any,
      amount: payload.amount.toString(),
      incurredAt: new Date(payload.incurredAt),
      vendor: payload.vendor ?? null,
      receiptUrl: payload.receiptUrl ?? null,
      bookingId: payload.bookingId ?? null,
      createdById: createdById ?? null,
      notes: payload.notes ?? null,
    } as any,
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
  const where: any = {};
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
  const payments = await prisma.payment.findMany({ where: { status: "COMPLETED", processedAt: { gte: start ?? new Date(0), lte: end ?? new Date() } } as any });
  const expenses = await prisma.expense.findMany({ where: { incurredAt: { gte: start ?? new Date(0), lte: end ?? new Date() } } as any });

  const revenue = payments.reduce((s, p) => s + decimalToNumber(p.amount), 0);
  const expenseTotal = expenses.reduce((s, e) => s + decimalToNumber(e.amount), 0);
  const profit = revenue - expenseTotal;

  // outstanding - sum of booking.balanceDue > 0
  const outstandingBookings = await prisma.booking.findMany({ where: { balanceDue: { gt: 0 } as any } as any, select: { balanceDue: true } as any });
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
  const bookings = await prisma.booking.findMany({ where: { balanceDue: { gt: 0 } as any }, include: { customer: true } as any }) as any[];
  const map: Record<string, { customerId: string; customerName: string; email: string | null; outstanding: number }> = {};

  for (const b of bookings) {
    const cid = b.customer.id as string;
    const name = `${b.customer.firstName} ${b.customer.lastName}`;
    map[cid] = map[cid] || { customerId: cid, customerName: name, email: b.customer.email ?? null, outstanding: 0 };
    map[cid].outstanding += decimalToNumber(b.balanceDue);
  }

  return Object.values(map);
}