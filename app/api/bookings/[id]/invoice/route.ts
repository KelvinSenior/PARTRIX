import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { generateInvoicePdf } from "@/services/invoice";
import { hasPermission } from "@/lib/rolePolicy";

const idSchema = z.string().uuid({ message: "Invalid booking ID." });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("You must be signed in to view invoices.", 401);
  if (!hasPermission(user.role, "finance:read")) return apiError("You do not have permission to view invoices.", 403);

  const routeParams = await Promise.resolve(params);
  const parsedId = idSchema.safeParse(routeParams.id);
  if (!parsedId.success) return apiError(parsedId.error.issues[0].message, 400);

  const invoice = await generateInvoicePdf(parsedId.data);
  if (!invoice) return apiError("Booking not found.", 404);

  return new Response(invoice.pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
