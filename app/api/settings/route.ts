import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, validationError } from "@/lib/apiErrors";
import { getOrganizationSettings, updateOrganizationSettings } from "@/services/settings";
import { settingsSchema } from "@/lib/settingsValidation";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const settings = await getOrganizationSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid JSON payload.", 400);

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const settings = await updateOrganizationSettings(parsed.data);
  return NextResponse.json({ settings });
}
