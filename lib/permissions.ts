import { requireOrganizationContext } from "@/lib/tenant";
import { ForbiddenError } from "@/lib/domainErrors";
import { hasPermission, type Permission } from "@/lib/rolePolicy";

export { hasPermission };
export type { Permission };

export async function requirePermission(permission: Permission) {
  const user = await requireOrganizationContext();
  if (!hasPermission(user.role, permission)) {
    throw new ForbiddenError();
  }
  return user;
}