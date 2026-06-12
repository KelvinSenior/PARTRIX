/**
 * Partrix CORS Configuration
 * Implements production-grade CORS security
 */

import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

const getAllowedOrigins = (): string[] => {
  if (env.NODE_ENV === "production") {
    // In production, only allow configured origin
    return env.ALLOWED_ORIGIN ? [env.ALLOWED_ORIGIN] : [];
  }

  // Development: allow localhost variations
  return [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ];
};

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Allow same-site requests

  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.some((allowed) => {
    // Exact match
    if (allowed === origin) return true;

    // For development, allow any localhost variant
    if (env.NODE_ENV === "development" && origin.startsWith("http://localhost")) {
      return true;
    }

    return false;
  });
}

/**
 * Get CORS headers for response
 */
export function getCORSHeaders(origin: string | null) {
  const allowedOrigins = getAllowedOrigins();
  const isAllowed = origin && allowedOrigins.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "null",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", // 24 hours
    "Access-Control-Expose-Headers": "X-Total-Count, X-Page-Number",
  };
}

/**
 * Handle CORS preflight requests
 */
export function handleCORSPreflight(request: NextRequest): NextResponse | null {
  if (request.method !== "OPTIONS") {
    return null;
  }

  const origin = request.headers.get("origin");

  if (!isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: getCORSHeaders(origin),
  });
}

/**
 * Validate and add CORS headers to response
 */
export function applySecurityHeaders(
  response: NextResponse,
  origin: string | null,
): NextResponse {
  const headers = getCORSHeaders(origin);

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add additional security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "0");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}
