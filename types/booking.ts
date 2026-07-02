export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface BookingItemPayload {
  inventoryItemId: string;
  quantity: number;
  discount: number;
  notes?: string;
}

export interface BookingCustomerPayload {
  id?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
}

export interface BookingPayload {
  customer: BookingCustomerPayload;
  eventDate: string;
  deliveryDate?: string | null;
  returnDate?: string | null;
  status: BookingStatus;
  deliveryFee: number;
  setupFee: number;
  discount: number;
  notes?: string;
  items: BookingItemPayload[];
}

export interface BookingItemDTO {
  id: string;
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  returnedQuantity: number;
  notes: string | null;
}

export interface BookingDTO {
  id: string;
  bookingNumber: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    address: string | null;
  };
  eventDate: string;
  deliveryDate: string | null;
  returnDate: string | null;
  status: BookingStatus;
  notes: string | null;
  deliveryFee: number;
  setupFee: number;
  discount: number;
  totalAmount: number;
  depositAmount: number;
  depositPaid: number;
  depositRefunded: number;
  depositOutstanding: number;
  depositStatus:
    | "PENDING"
    | "PAID"
    | "HELD"
    | "REFUNDED"
    | "PARTIALLY_REFUNDED"
    | "FORFEITED";
  refundStatus: "NONE" | "REQUESTED" | "APPROVED" | "PARTIAL" | "FORFEITED";
  balanceDue: number;
  bookingItems: BookingItemDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface BookingListResponse {
  bookings: BookingDTO[];
}

export interface BookingReturnPayload {
  returnItems: Array<{
    bookingItemId: string;
    quantity: number;
  }>;
}
