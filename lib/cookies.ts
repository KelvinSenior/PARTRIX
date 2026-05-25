import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, TOKEN_MAX_AGE_SECONDS } from "@/lib/jwt";
import { env } from "@/lib/env";

export const AUTH_COOKIE_OPTIONS = {
  name: AUTH_COOKIE_NAME,
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: TOKEN_MAX_AGE_SECONDS,
};

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    ...AUTH_COOKIE_OPTIONS,
    value: token,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: AUTH_COOKIE_NAME, path: "/" });
}

export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value || null;
}
