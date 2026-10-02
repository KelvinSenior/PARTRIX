import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, validationError } from "@/lib/apiErrors";
import { createInvitation, listInvitations } from "@/services/invitation";

const invitationSchema = z.object({
  email: z.string().trim().email().max(254).toLowerCase(),
  role: z.enum(["MANAGER", "STAFF"]),
});

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  try {
    const invitations = await listInvitations();
    return NextResponse.json({ invitations });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to list invitations.", 403);
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const body = await request.json().catch(() => null);
  const parsed = invitationSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const invitation = await createInvitation(parsed.data.email, parsed.data.role);
    const inviteUrl = `/signup?${new URLSearchParams({ invite: invitation.token }).toString()}`;
    return NextResponse.json({ invitation: { ...invitation, token: undefined, inviteUrl } }, { status: 201 });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to create invitation.", 403);
  }
}