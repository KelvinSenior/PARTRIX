export type DeliveryStatus =
  | "SCHEDULED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export interface DeliveryPayload {
  bookingId: string;
  customerId: string;
  address: string;
  scheduledAt: string;
  driver?: string | null;
  vehicle?: string | null;
  instructions?: string | null;
}

export interface DeliveryDTO {
  id: string;
  bookingId: string;
  bookingNumber?: string | null;
  customerId: string;
  customerName?: string | null;
  address: string;
  scheduledAt: string;
  deliveredAt?: string | null;
  pickupAt?: string | null;
  driver?: string | null;
  vehicle?: string | null;
  instructions?: string | null;
  status: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
}
