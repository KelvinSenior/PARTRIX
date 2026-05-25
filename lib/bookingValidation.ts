import { z } from "zod";
import type { BookingStatus } from "@/types/booking";

export const bookingItemSchema = z.object({
  inventoryItemId: z.string().uuid({ message: "Select a valid inventory item." }),
  quantity: z
    .number({ message: "Quantity must be a number." })
    .int({ message: "Quantity must be a whole number." })
    .positive({ message: "Quantity must be at least 1." }),
  discount: z
    .number({ message: "Discount must be a number." })
    .min(0, { message: "Discount cannot be negative." })
    .default(0),
  notes: z.string().max(250, "Item notes cannot be longer than 250 characters.").optional(),
});

export const bookingCustomerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().email("Enter a valid email address.").optional().nullable(),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export const bookingPayloadSchema = z
  .object({
    customer: bookingCustomerSchema,
    eventDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Event date must be a valid date.",
    }),
    deliveryDate: z.string().nullable().optional().refine(
      (value) => value === null || value === undefined || !Number.isNaN(Date.parse(value)),
      { message: "Delivery date must be a valid date." },
    ),
    returnDate: z.string().nullable().optional().refine(
      (value) => value === null || value === undefined || !Number.isNaN(Date.parse(value)),
      { message: "Return date must be a valid date." },
    ),
    status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]),
    deliveryFee: z.number().min(0, "Delivery fee cannot be negative.").default(0),
    setupFee: z.number().min(0, "Setup fee cannot be negative.").default(0),
    discount: z.number().min(0, "Discount cannot be negative.").default(0),
    notes: z.string().max(1000, "Booking notes cannot exceed 1000 characters.").optional(),
    items: z.array(bookingItemSchema).min(1, "Add at least one inventory item to the booking."),
  })
  .superRefine((booking, ctx) => {
    const eventDate = new Date(booking.eventDate);
    const returnDate = booking.returnDate ? new Date(booking.returnDate) : null;
    const deliveryDate = booking.deliveryDate ? new Date(booking.deliveryDate) : null;

    if (deliveryDate && deliveryDate > eventDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryDate"],
        message: "Delivery date should be on or before the event date.",
      });
    }

    if (returnDate && returnDate < eventDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["returnDate"],
        message: "Return date should be on or after the event date.",
      });
    }
  });

export const bookingReturnSchema = z.object({
  returnItems: z
    .array(
      z.object({
        bookingItemId: z.string().uuid({ message: "Select a valid booking item." }),
        quantity: z
          .number({ message: "Quantity must be a number." })
          .int({ message: "Quantity must be a whole number." })
          .positive({ message: "Return quantity must be at least 1." }),
      }),
    )
    .min(1, "Select at least one item to return."),
});

export type BookingPayload = z.infer<typeof bookingPayloadSchema>;
export type BookingReturnPayload = z.infer<typeof bookingReturnSchema>;
