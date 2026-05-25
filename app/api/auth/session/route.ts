import { NextResponse } from "next/server";
import { getAuthCookie } from "@/lib/cookies";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rateLimiter";

export async function GET(request: Request) {
  // Rate limiting for session checks (mild limit to prevent token enumeration)
  const rateLimit = enforceRateLimit(request, "auth-session");
  if (!rateLimit.allowed) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const token = await getAuthCookie();

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Check if user is active
  if (user.status !== "ACTIVE") {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
