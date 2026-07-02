export type PaymentMethod =
  "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "CHECK" | "MOBILE_WALLET";

export interface PaymentPayload {
  bookingId?: string | null;
  amount: number;
  method: PaymentMethod;
  type?: PaymentType;
  notes?: string;
  transactionReference?: string;
}

export type PaymentType = "RENTAL" | "SECURITY_DEPOSIT" | "REFUND";

export interface PaymentDTO {
  id: string;
  bookingId: string | null;
  bookingNumber?: string | null;
  customerName?: string | null;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  status: string;
  transactionReference: string | null;
  processedById: string | null;
  processedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ExpensePayload {
  category: string;
  amount: number;
  incurredAt: string; // ISO date
  vendor?: string;
  receiptUrl?: string;
  bookingId?: string | null;
  notes?: string;
}

export interface ExpenseDTO {
  id: string;
  category: string;
  amount: number;
  incurredAt: string;
  vendor: string | null;
  receiptUrl: string | null;
  bookingId: string | null;
  createdById: string | null;
  notes: string | null;
  createdAt: string;
}

export interface FinanceSummary {
  totals: {
    revenue: number;
    expenses: number;
    profit: number;
    outstanding: number;
  };
  monthly: Array<{
    month: string; // YYYY-MM
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}

export interface PaymentsListResponse {
  payments: PaymentDTO[];
}

export interface ExpensesListResponse {
  expenses: ExpenseDTO[];
}
