"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname() || "/";

  const navItems = [
    { label: "Overview", href: "/dashboard" },
    { label: "Bookings", href: "/bookings" },
    { label: "Deliveries", href: "/deliveries" },
    { label: "Inventory", href: "/inventory" },
    { label: "Customers", href: "/customers" },
    { label: "Finance", href: "/finance" },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative w-72 bg-white p-4 dark:bg-zinc-950">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Menu</h3>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-sm">Close</button>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onClose} className={`block rounded-md px-3 py-2 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-zinc-700 hover:bg-zinc-100'}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
