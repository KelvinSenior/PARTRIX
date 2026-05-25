import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/jwt";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/session",
  "/api/auth/logout",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  });
}

function getCookieToken(request: NextRequest) {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  if (isPublicPath(pathname)) {
    if (isApi && request.method === "GET") {
      const response = NextResponse.next();
      response.headers.set("Cache-Control", "public, max-age=60, s-maxage=60, stale-while-revalidate=120");
      return response;
    }
    return NextResponse.next();
  }

  const token = getCookieToken(request);
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    if (isApi) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
    if (isApi) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }
    const redirectUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (request.method === "GET" && pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "public, max-age=60, s-maxage=60, stale-while-revalidate=120");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventory/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/customers/:path*",
    "/bookings/:path*",
    "/deliveries/:path*",
    "/finance/:path*",
    "/damage/:path*",
    "/api/:path*",
  ],
};
