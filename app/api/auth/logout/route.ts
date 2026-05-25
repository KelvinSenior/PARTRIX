import { clearAuthCookie } from "@/lib/cookies";
import { enforceRateLimit } from "@/lib/rateLimiter";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Rate limiting for logout attempts
  const rateLimit = enforceRateLimit(request, "auth-logout");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many logout attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter ?? 60) },
      },
    );
  }

  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
