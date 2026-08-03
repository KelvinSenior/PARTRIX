import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { maxImageSize, persistInventoryImage } from "@/lib/imageUpload";
import { validateFileUpload } from "@/lib/securityUtils";
import { enforceRateLimit } from "@/lib/rateLimiter";

export const runtime = "nodejs";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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

  const validation = validateFileUpload(file, allowedTypes, maxImageSize);
  if (!validation.valid) {
    return apiError(validation.error || "File validation failed.", 415);
  }

  try {
    const imageUrl = await persistInventoryImage(file);
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("[SECURITY] File write error:", error);
    return apiError("Failed to save file.", 500);
  }
}

