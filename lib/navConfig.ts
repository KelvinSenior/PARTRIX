import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/types/auth";
import { hasPermission, type Permission } from "@/lib/rolePolicy";
import {
  CalendarDays,
  LayoutDashboard,
  Package,
  Settings,
  Truck,
  Users,
  Wallet,
  AlertTriangle,
  Bell,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
  match?: (pathname: string) => boolean;
};

export const primaryNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/bookings", icon: CalendarDays },
  { label: "Deliveries", href: "/deliveries", icon: Truck },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Finance", href: "/finance", icon: Wallet, permission: "finance:read" },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Damage", href: "/damage", icon: AlertTriangle },
];

export const mobileBottomNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/bookings", icon: CalendarDays },
  { label: "Deliveries", href: "/deliveries", icon: Truck },
  { label: "Stock", href: "/inventory", icon: Package },
  { label: "Finance", href: "/finance", icon: Wallet, permission: "finance:read" },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getNavItemsForRole(role: UserRole) {
  return primaryNavItems.filter((item) => !item.permission || hasPermission(role, item.permission));
}

export function getMobileNavItemsForRole(role?: UserRole) {
  return mobileBottomNavItems.filter(
    (item) => !item.permission || (role !== undefined && hasPermission(role, item.permission)),
  );
}
