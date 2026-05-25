import { getAuthCookie } from "@/lib/cookies";
import { getCurrentUserFromToken } from "@/services/auth";

export async function getAuthenticatedUser() {
  const token = await getAuthCookie();
  return token ? getCurrentUserFromToken(token) : null;
}

