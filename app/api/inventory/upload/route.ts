import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { validateFileUpload } from "@/lib/securityUtils";
import { enforceRateLimit } from "@/lib/rateLimiter";

export const runtime = "nodejs";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const maxImageSize = 5 * 1024 * 1024;

export async function POST(request: Request) {
  // Rate limiting for file uploads
  const rateLimit = enforceRateLimit(request, "inventory-upload");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many upload attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter ?? 60) },
      },
    );
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return apiError("You must be signed in to upload inventory images.", 401);
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return apiError("Choose an image to upload.", 400);
  }

  // Validate file upload
  const validation = validateFileUpload(file, allowedTypes, maxImageSize);
  if (!validation.valid) {
    return apiError(validation.error || "File validation failed.", 415);
  }

  const extension = allowedTypes.get(file.type);
  if (!extension) {
    return apiError("Inventory images must be JPG, PNG, WEBP, or GIF.", 415);
  }

  // Create upload directory with safe path
  const uploadsDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "inventory",
  );
  
  // Ensure path doesn't escape intended directory
  const resolvedPath = path.resolve(uploadsDir);
  const expectedPath = path.resolve(process.cwd(), "public", "uploads", "inventory");
  if (!resolvedPath.startsWith(expectedPath)) {
    return apiError("Invalid upload path.", 400);
  }

  await mkdir(uploadsDir, { recursive: true });

  // Generate secure filename
  const filename = `${Date.now()}-${randomUUID()}.${extension}`;
  const destination = path.join(uploadsDir, filename);
  
  // Verify destination doesn't escape directory
  const resolvedDest = path.resolve(destination);
  if (!resolvedDest.startsWith(resolvedPath)) {
    return apiError("Invalid file destination.", 400);
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    await writeFile(destination, bytes);
  } catch (error) {
    console.error("[SECURITY] File write error:", error);
    return apiError("Failed to save file.", 500);
  }

  return NextResponse.json({
    imageUrl: `/uploads/inventory/${filename}`,
  });
}

