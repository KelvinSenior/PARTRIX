"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname() || "/";

  const items = [
    { label: 'Home', href: '/dashboard', icon: 'M3 12h18' },
    { label: 'Bookings', href: '/bookings', icon: 'M3 6h18 M3 18h18' },
    { label: 'Deliveries', href: '/deliveries', icon: 'M3 12h18' },
    { label: 'Inventory', href: '/inventory', icon: 'M3 12h18' },
    { label: 'Customers', href: '/customers', icon: 'M3 12h18' },
  ];

  return (
    <nav className="bottom-nav">
      <div className="mx-auto max-w-3xl px-4">
        <div className="backdrop-blur-sm rounded-t-xl border-t border-zinc-200/80 bg-white/90 dark:bg-zinc-950/90 flex items-center justify-between shadow-lg p-2">
          {items.map((it) => {
            const active = pathname.startsWith(it.href);
            return (
              <Link key={it.href} href={it.href} className={`touch-target flex-1 text-center text-sm ${active ? 'text-indigo-600' : 'text-zinc-700'}`}>
                <div className="mx-auto h-6 w-6" aria-hidden>
                  <svg className="h-6 w-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </div>
                <div className="text-xs">{it.label}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
