import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, validationError } from "@/lib/apiErrors";
import { getBooking, returnBookingItems, cancelBooking, updateBookingStatus } from "@/services/booking";

const bookingUpdateSchema = z.object({
  action: z.enum(["return", "cancel", "updateStatus"]),
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
    .optional(),
  status: z
    .enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .optional(),
});

const idSchema = z.string().uuid({ message: "Invalid booking ID." });

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return apiError("You must be signed in to view bookings.", 401);
  }

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return apiError(parsedId.error.issues[0].message, 400);

  const booking = await getBooking(parsedId.data);

  if (!booking) {
    return apiError("Booking not found.", 404);
  }

  return NextResponse.json({ booking });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return apiError("You must be signed in to update bookings.", 401);
  }

  const body = await request.json().catch(() => null);
  const payload = bookingUpdateSchema.safeParse(body);

  if (!payload.success) {
    return validationError(payload.error);
  }

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return apiError(parsedId.error.issues[0].message, 400);

  try {
    if (payload.data.action === "return") {
      if (!payload.data.returnItems) {
        return apiError("Return items are required for a return action.", 400);
      }

      const booking = await returnBookingItems(parsedId.data, { returnItems: payload.data.returnItems });
      return NextResponse.json({ booking });
    }

    if (payload.data.action === "cancel") {
      const booking = await cancelBooking(parsedId.data);
      return NextResponse.json({ booking });
    }

    if (payload.data.action === "updateStatus") {
      if (!payload.data.status) {
        return apiError("Status is required for updateStatus action.", 400);
      }
      const booking = await updateBookingStatus(parsedId.data, payload.data.status);
      return NextResponse.json({ booking });
    }

    return apiError("Unsupported booking update action.", 400);
  } catch (error) {
    if (typeof error === "object" && error !== null && "message" in error) {
      return apiError((error as Error).message, 400);
    }

    return apiError("Booking update failed.", 500);
  }
}
