import { z } from "zod";

export const deliveryPayloadSchema = z.object({
  bookingId: z.string().uuid({ message: "A valid booking is required." }),
  customerId: z.string().uuid({ message: "A valid customer is required." }),
  address: z.string().min(3, "Delivery address is required."),
  scheduledAt: z.string().min(1, "Scheduled date/time is required."),
  driver: z.string().optional().nullable(),
  vehicle: z.string().optional().nullable(),
  instructions: z.string().max(500).optional().nullable(),
});

export type DeliveryPayload = z.infer<typeof deliveryPayloadSchema>;

export const deliveryUpdateSchema = z.object({
  status: z
    .enum(["SCHEDULED", "IN_TRANSIT", "DELIVERED", "COMPLETED", "CANCELLED"])
    .optional(),
  driver: z.string().optional().nullable(),
  vehicle: z.string().optional().nullable(),
  instructions: z.string().max(500).optional().nullable(),
  address: z.string().min(3).optional(),
  scheduledAt: z.string().optional(),
});
