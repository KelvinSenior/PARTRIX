import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { revokeInvitation } from "@/services/invitation";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const { id } = await context.params;
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) return apiError("Invalid invitation ID.", 400);

  try {
    const revoked = await revokeInvitation(parsedId.data);
    if (!revoked) return apiError("Invitation not found.", 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to revoke invitation.", 403);
  }
}