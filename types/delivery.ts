export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';

export interface DeliveryPayload {
  pickupAddress: string;
  dropoffAddress: string;
  scheduledAt?: string | null;
  packageDetails?: string;
  assignedDriverId?: string | null;
  vehicleId?: string | null;
}

export interface DeliveryDTO extends DeliveryPayload {
  id: string;
  status: DeliveryStatus;
  notes: string[];
  createdAt: string;
  updatedAt: string;
}
