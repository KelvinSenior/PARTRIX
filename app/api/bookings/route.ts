import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, validationError } from "@/lib/apiErrors";
import { bookingPayloadSchema } from "@/lib/bookingValidation";
import { createBooking, listBookings } from "@/services/booking";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return apiError("You must be signed in to manage bookings.", 401);
  }

  const result = await listBookings();
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return apiError("You must be signed in to manage bookings.", 401);
  }

  const body = await request.json().catch(() => null);
  const payload = bookingPayloadSchema.safeParse(body);

  if (!payload.success) {
    return validationError(payload.error);
  }

  try {
    const booking = await createBooking(payload.data);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "message" in error) {
      return apiError((error as Error).message, 400);
    }

    return apiError("Booking could not be created.", 500);
  }
}
