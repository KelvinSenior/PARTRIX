import jwt from "jsonwebtoken";
import { env } from "@/lib/env";
import { JwtPayload, JwtTokenPayload } from "@/types/auth";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const CURRENT_ISSUER = "partrix";
const LEGACY_ISSUER = "rentflow";

export const AUTH_COOKIE_NAME = "partrix_token";

export function signToken(payload: JwtTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: `${MAX_AGE_SECONDS}s`,
    issuer: CURRENT_ISSUER,
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      issuer: [CURRENT_ISSUER, LEGACY_ISSUER],
    });

    if (!payload || typeof payload !== "object") {
      return null;
    }

    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export const TOKEN_MAX_AGE_SECONDS = MAX_AGE_SECONDS;
