import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError, validationError } from "@/lib/apiErrors";
import { getDamageReport, resolveDamageReport } from "@/services/damage";
import { resolveDamageSchema } from "@/lib/damageValidation";

const idSchema = z.string().uuid({ message: "Invalid damage report ID." });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return apiError(parsedId.error.issues[0].message, 400);

  const dr = await getDamageReport(parsedId.data);
  if (!dr) return apiError("Not found.", 404);
  return NextResponse.json({ damage: dr });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const { id } = await params;
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return apiError(parsedId.error.issues[0].message, 400);

  const body = await request.json().catch(() => null);
  const parsed = resolveDamageSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const updated = await resolveDamageReport(parsedId.data, parsed.data);
    if (!updated) return apiError("Not found.", 404);
    return NextResponse.json({ damage: updated });
  } catch (err: any) {
    return apiError(err.message ?? "Error", 500);
  }
}
