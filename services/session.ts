import { SessionUser } from "@/types/auth";

export async function fetchSessionUser(): Promise<SessionUser | null> {
  const response = await fetch("/api/auth/session", {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  return result.user ?? null;
}
