export interface CustomerPayload {
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface CustomerDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetailDTO extends CustomerDTO {
  bookingCount: number;
  totalSpent: number;
  outstandingBalance: number;
  lastBookingDate: string | null;
}

export interface CustomerListResponse {
  customers: CustomerDTO[];
  total: number;
}

export interface CustomerSearchParams {
  query?: string;
  sortBy?: "createdAt" | "firstName" | "lastName" | "email" | "company";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
