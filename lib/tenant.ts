import { getAuthCookie } from "@/lib/cookies";
import { getCurrentUserFromToken } from "@/services/auth";

export async function getCurrentTenantUser() {
  const token = await getAuthCookie();
  if (!token) return null;

  return getCurrentUserFromToken(token);
}

export async function getCurrentOrganizationId() {
  const user = await getCurrentTenantUser();
  return user?.organizationId ?? null;
}

export async function requireOrganizationContext() {
  const user = await getCurrentTenantUser();

  if (!user || !user.organizationId) {
    throw new Error("You must belong to an organization to access this workspace.");
  }

  return user;
}
