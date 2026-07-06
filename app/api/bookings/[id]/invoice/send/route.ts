import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, validationError } from "@/lib/apiErrors";
import { sendInvoiceEmail } from "@/services/invoice";

const idSchema = z.string().uuid({ message: "Invalid booking ID." });
const sendInvoiceSchema = z.object({
  to: z.string().trim().email("Enter a valid recipient email address."),
  message: z.string().trim().max(1200, "Message cannot exceed 1200 characters.").optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("You must be signed in to send invoices.", 401);

  const routeParams = await Promise.resolve(params);
  const parsedId = idSchema.safeParse(routeParams.id);
  if (!parsedId.success) return apiError(parsedId.error.issues[0].message, 400);

  const body = await request.json().catch(() => null);
  const payload = sendInvoiceSchema.safeParse(body);
  if (!payload.success) return validationError(payload.error);

  try {
    const result = await sendInvoiceEmail({
      bookingId: parsedId.data,
      to: payload.data.to,
      message: payload.data.message,
      userId: user.id,
    });

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    return apiError((error as Error).message || "Invoice could not be sent.", 400);
  }
}
