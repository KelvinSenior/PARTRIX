import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { listOrganizationMembers } from "@/services/membership";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  try {
    const members = await listOrganizationMembers();
    return NextResponse.json({ members });
  } catch {
    return apiError("You do not have permission to view workspace members.", 403);
  }
}