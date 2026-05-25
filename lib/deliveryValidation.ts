import { z } from "zod";

export const deliveryPayloadSchema = z.object({
  pickupAddress: z.string().min(3, "Pickup address required"),
  dropoffAddress: z.string().min(3, "Dropoff address required"),
  scheduledAt: z.string().optional().nullable(),
  packageDetails: z.string().max(200).optional(),
  assignedDriverId: z.string().optional().nullable(),
  vehicleId: z.string().optional().nullable(),
});

export type DeliveryPayload = z.infer<typeof deliveryPayloadSchema>;
