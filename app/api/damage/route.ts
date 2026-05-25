import { NextResponse } from "next/server";
import { createDamageReport, listDamageReports } from "@/services/damage";
import { createDamageSchema } from "@/lib/damageValidation";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, validationError } from "@/lib/apiErrors";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const rows = await listDamageReports();
  return NextResponse.json({ items: rows });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const body = await request.json().catch(() => null);
  const parsed = createDamageSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const dr = await createDamageReport(parsed.data, user.id);
    return NextResponse.json({ damage: dr }, { status: 201 });
  } catch (err: any) {
    return apiError(err.message ?? "Error", 500);
  }
}
