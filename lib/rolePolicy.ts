import type { UserRole } from "@/types/auth";

export type Permission =
  | "bookings:read" | "bookings:create" | "bookings:update" | "bookings:return" | "bookings:cancel" | "bookings:status"
  | "customers:read" | "customers:write" | "customers:delete"
  | "inventory:read" | "inventory:write" | "inventory:delete"
  | "damage:read" | "damage:report" | "damage:resolve"
  | "deliveries:read" | "deliveries:write"
  | "finance:read" | "finance:record" | "finance:refund"
  | "expenses:read" | "expenses:record"
  | "settings:read" | "settings:manage" | "members:manage"
  | "notifications:manage" | "audit:read";

const adminPermissions: Permission[] = [
  "bookings:read", "bookings:create", "bookings:update", "bookings:return", "bookings:cancel", "bookings:status",
  "customers:read", "customers:write", "customers:delete",
  "inventory:read", "inventory:write", "inventory:delete",
  "damage:read", "damage:report", "damage:resolve",
  "deliveries:read", "deliveries:write",
  "finance:read", "finance:record", "finance:refund",
  "expenses:read", "expenses:record",
  "settings:read", "settings:manage", "members:manage", "notifications:manage", "audit:read",
];

const managerPermissions: Permission[] = adminPermissions.filter((permission) =>
  permission !== "settings:manage" && permission !== "members:manage" && permission !== "finance:refund",
);

const staffPermissions: Permission[] = [
  "bookings:read", "bookings:create", "bookings:update", "bookings:return",
  "customers:read", "customers:write",
  "inventory:read",
  "damage:read", "damage:report",
  "deliveries:read", "deliveries:write",
  "finance:record", "expenses:record",
  "settings:read", "notifications:manage",
];

const rolePermissions: Record<UserRole, ReadonlySet<Permission>> = {
  ADMIN: new Set(adminPermissions),
  MANAGER: new Set(managerPermissions),
  STAFF: new Set(staffPermissions),
};

export function hasPermission(role: UserRole, permission: Permission) {
  return rolePermissions[role].has(permission);
}