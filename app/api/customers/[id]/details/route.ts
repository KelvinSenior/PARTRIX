import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { getCustomerDetail, getCustomerBookings, getCustomerAnalytics } from "@/services/customer";

const idSchema = z.string().uuid({ message: "Invalid customer ID." });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return apiError(parsedId.error.issues[0].message, 400);

  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const detail = await getCustomerDetail(parsedId.data);
  if (!detail) return apiError("Customer not found.", 404);

  const bookings = await getCustomerBookings(parsedId.data);
  const analytics = await getCustomerAnalytics(parsedId.data);

  return NextResponse.json({ customer: detail, bookings, analytics });
}
