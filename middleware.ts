import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

/**
 * Production Middleware
 * Handles CORS, security headers, and request validation in production
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const isPublic = pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/signup");

  // Production security checks
  if (env.NODE_ENV === "production") {
    // Enforce HTTPS redirect (Vercel handles this, but belt and suspenders)
    if (request.headers.get("x-forwarded-proto") !== "https" && env.NODE_ENV === "production") {
      const secureUrl = new URL(request.url);
      secureUrl.protocol = "https:";
      return NextResponse.redirect(secureUrl);
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  // CORS headers for API routes
  if (isApi) {
    const origin = request.headers.get("origin");
    const allowedOrigins = env.ALLOWED_ORIGIN ? [env.ALLOWED_ORIGIN] : [];

    if (allowedOrigins.length > 0 && origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    response.headers.set("X-API-Version", "1.0");
    response.headers.set("X-Content-Type-Options", "nosniff");
  }

  // Add cache headers for static assets
  if (pathname.startsWith("/public/") || pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|ico|woff|woff2)$/i)) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  } else if (isPublic) {
    response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=604800");
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/inventory/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/customers/:path*",
    "/bookings/:path*",
    "/deliveries/:path*",
    "/finance/:path*",
    "/damage/:path*",
  ],
};
