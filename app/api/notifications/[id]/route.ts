import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { deleteNotification, markNotificationRead } from "@/services/notification";

const idSchema = z.string().uuid({ message: "Invalid notification ID." });

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return apiError(parsedId.error.issues[0].message, 400);

  const notification = await markNotificationRead(parsedId.data);
  if (!notification) return apiError("Notification not found.", 404);

  return NextResponse.json({ notification });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return apiError(parsedId.error.issues[0].message, 400);

  await deleteNotification(parsedId.data);
  return NextResponse.json({ success: true });
}
