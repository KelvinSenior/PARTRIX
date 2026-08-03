import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { deleteReadNotifications, listNotifications, markAllNotificationsRead } from "@/services/notification";

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return apiError("Authentication required.", 401);

    const url = new URL(request.url);
    const dateFrom = url.searchParams.get("from");
    const dateTo = url.searchParams.get("to");

    const result = await listNotifications({
      query: url.searchParams.get("q") || undefined,
      type: url.searchParams.get("type") || undefined,
      status: url.searchParams.get("status") || undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      page: Number(url.searchParams.get("page") || 1),
      pageSize: Number(url.searchParams.get("pageSize") || 20),
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
