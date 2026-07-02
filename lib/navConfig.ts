import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  LayoutDashboard,
  Package,
  Settings,
  Truck,
  Users,
  Wallet,
  AlertTriangle,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
};

export const primaryNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/bookings", icon: CalendarDays },
  { label: "Deliveries", href: "/deliveries", icon: Truck },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Finance", href: "/finance", icon: Wallet },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Damage", href: "/damage", icon: AlertTriangle },
];

export const mobileBottomNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/bookings", icon: CalendarDays },
  { label: "Deliveries", href: "/deliveries", icon: Truck },
  { label: "Stock", href: "/inventory", icon: Package },
  { label: "Finance", href: "/finance", icon: Wallet },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
