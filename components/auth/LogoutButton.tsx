"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type LogoutButtonProps = {
  className?: string;
  label?: string;
  onLogout?: () => void;
};

export default function LogoutButton({ className, label = "Logout", onLogout }: LogoutButtonProps) {
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    onLogout?.();
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      <LogOut className="h-4 w-4" aria-hidden />
      <span>{label}</span>
    </button>
  );
}
