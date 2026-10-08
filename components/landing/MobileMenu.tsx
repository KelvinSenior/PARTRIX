"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navigation = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#audience" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#how-it-works" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>

      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!open}
        className="absolute right-0 top-14 z-50 w-[min(20rem,calc(100vw-2.5rem))] rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
      >
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={closeMenu}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
          <Link
            href="/login"
            onClick={closeMenu}
            className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            onClick={closeMenu}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0B1020] px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Get started
          </Link>
        </div>
      </nav>
    </div>
  );
}
