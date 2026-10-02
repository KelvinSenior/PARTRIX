import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { z } from "zod";
import { deleteReadNotifications, listNotifications, markAllNotificationsRead } from "@/services/notification";

const notificationQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  type: z.enum(["all", "BOOKING", "PAYMENT", "INVENTORY", "INVOICE", "ORGANIZATION", "SYSTEM"]).optional(),
  status: z.enum(["all", "read", "unread"]).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
}).refine((query) => !query.from || !query.to || new Date(query.from) <= new Date(query.to), {
  path: ["to"],
  message: "The end date must be on or after the start date.",
});

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return apiError("Authentication required.", 401);

    const url = new URL(request.url);
    const parsed = notificationQuerySchema.safeParse({
      q: url.searchParams.get("q") || undefined,
      type: url.searchParams.get("type") || undefined,
      status: url.searchParams.get("status") || undefined,
      from: url.searchParams.get("from") || undefined,
      to: url.searchParams.get("to") || undefined,
      page: url.searchParams.get("page") || undefined,
      pageSize: url.searchParams.get("pageSize") || undefined,
    });
    if (!parsed.success) return apiError("Invalid notification filters.", 400, { fields: parsed.error.flatten().fieldErrors });

    const result = await listNotifications({
      query: parsed.data.q,
      type: parsed.data.type,
      status: parsed.data.status,
      dateFrom: parsed.data.from ? new Date(parsed.data.from) : undefined,
      dateTo: parsed.data.to ? new Date(parsed.data.to) : undefined,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load notifications.";
    return apiError(message, 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return apiError("Authentication required.", 401);

    const body = await request.json().catch(() => ({}));
    if (body?.action === "markAllRead") {
      await markAllNotificationsRead();
      return NextResponse.json({ success: true });
    }

    return apiError("Unsupported notification action.", 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update notifications.";
    return apiError(message, 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return apiError("Authentication required.", 401);

    const url = new URL(request.url);
    if (url.searchParams.get("scope") === "read") {
      await deleteReadNotifications();
      return NextResponse.json({ success: true });
    }

    return apiError("Choose a notification delete scope.", 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete notifications.";
    return apiError(message, 500);
  }
}
