import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { requireOrganizationContext } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]);
const maxSizeBytes = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const org = await requireOrganizationContext();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return apiError("No file was uploaded.", 400);
  }

  if (!allowedTypes.has(file.type)) {
    return apiError("Only PNG, JPG, JPEG, and SVG images are supported.", 400);
  }

  if (file.size > maxSizeBytes) {
    return apiError("The image must be 5 MB or smaller.", 400);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  await prisma.organization.update({
    where: { id: org.organizationId! },
    data: {
      settings: {
        ...(typeof (await prisma.organization.findUnique({ where: { id: org.organizationId! }, select: { settings: true } }))?.settings === "object" ? ((await prisma.organization.findUnique({ where: { id: org.organizationId! }, select: { settings: true } }))?.settings as object) : {}),
        business: {
          ...(typeof (await prisma.organization.findUnique({ where: { id: org.organizationId! }, select: { settings: true } }))?.settings === "object"
            ? ((await prisma.organization.findUnique({ where: { id: org.organizationId! }, select: { settings: true } }))?.settings as Record<string, unknown>).business ?? {}
            : {}),
          logoData: dataUrl,
          logoUrl: "",
        },
      } as any,
    },
  });

  return NextResponse.json({ logoUrl: dataUrl, success: true });
}

export async function DELETE() {
  const user = await getAuthenticatedUser();
  if (!user) return apiError("Authentication required.", 401);

  const org = await requireOrganizationContext();
  const existing = await prisma.organization.findUnique({ where: { id: org.organizationId! }, select: { settings: true } });
  const settings = (existing?.settings as Record<string, unknown> | null) ?? {};
  const business = (settings.business as Record<string, unknown> | null) ?? {};

  await prisma.organization.update({
    where: { id: org.organizationId! },
    data: {
      settings: {
        ...settings,
        business: {
          ...business,
          logoData: null,
          logoUrl: "",
        },
      } as any,
    },
  });

  return NextResponse.json({ success: true });
}
