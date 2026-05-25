"use client";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function BottomNavWrapper() {
  const pathname = usePathname() || "/";

  // Hide bottom nav on auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return null;
  }

  return <BottomNav />;
}
