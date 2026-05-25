import { NextResponse } from "next/server";
import { AUTH_COOKIE_OPTIONS } from "@/lib/cookies";
import { signToken } from "@/lib/jwt";
import { authenticateUser } from "@/services/auth";
import { UserRole } from "@/types/auth";
import { loginPayloadSchema } from "@/lib/authValidation";
import { enforceRateLimit } from "@/lib/rateLimiter";

function redirectWithError(request: Request, message: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const rateLimit = enforceRateLimit(request, "auth-login");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." }, 
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter ?? 60) },
      },
    );
  }

  const formData = await request.formData();
  const parsed = loginPayloadSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return redirectWithError(request, parsed.error.issues[0]?.message ?? "Email and password are required.");
  }

  try {
    const user = await authenticateUser(parsed.data.email, parsed.data.password);
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    const response = NextResponse.redirect(new URL("/dashboard", request.url), {
      status: 303,
    });
    response.cookies.set({ ...AUTH_COOKIE_OPTIONS, value: token });
    return response;
  } catch (error) {
    return redirectWithError(
      request,
      (error as Error)?.message ?? "Login failed.",
    );
  }
}

