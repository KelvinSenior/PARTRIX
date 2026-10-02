import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { changeMemberRole, removeOrganizationMember } from "@/services/membership";

type RouteContext = { params: Promise<{ id: string }> };
const idSchema = z.string().uuid();
const roleSchema = z.object({ role: z.enum(["MANAGER", "STAFF"]) });

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);
  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return apiError("Invalid member ID.", 400);
  const parsedBody = roleSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) return apiError("Choose a permitted member role.", 400);

  try {
    const updated = await changeMemberRole(parsedId.data, parsedBody.data.role);
    if (!updated) return apiError("Member not found.", 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to change member role.";
    return apiError(message, message.startsWith("You do not have permission") ? 403 : 400);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);
  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return apiError("Invalid member ID.", 400);

  try {
    const removed = await removeOrganizationMember(parsedId.data);
    if (!removed) return apiError("Member not found.", 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to remove member.";
    return apiError(message, message.startsWith("You do not have permission") ? 403 : 400);
  }
}