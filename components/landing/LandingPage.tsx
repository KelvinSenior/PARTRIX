"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CreditCard,
  Package,
  Truck,
  Users,
} from "lucide-react";
import PartrixLogo from "@/components/brand/PartrixLogo";

const features = [
  {
    icon: Package,
    title: "Inventory control",
    description: "Track availability, reservations, maintenance, and stock health across every rental item.",
  },
  {
    icon: CalendarDays,
    title: "Booking operations",
    description: "Manage reservations, deposits, returns, and daily schedules from a single operational view.",
  },
  {
    icon: Users,
    title: "Customer management",
    description: "Keep customer records, contacts, company details, and booking history close to the workflow.",
  },
  {
    icon: Truck,
    title: "Logistics coordination",
    description: "Coordinate pickups, deliveries, dispatch notes, and status updates for field teams.",
  },
  {
    icon: CreditCard,
    title: "Payments and expenses",
    description: "Record payments, monitor balances, and connect operating costs to business performance.",
  },
  {
    icon: BarChart3,
    title: "Reports and visibility",
    description: "Review revenue, expenses, bookings, and exports for cleaner decisions across the business.",
  },
];

const metrics = [
  { label: "Active bookings", value: "124", detail: "+18 this week" },
  { label: "Inventory health", value: "96%", detail: "live availability" },
  { label: "Payments captured", value: "$18.4k", detail: "today" },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Partrix",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Partrix helps rental businesses manage inventory, bookings, customers, logistics, payments, and daily operations from one centralized platform.",
};

export default function LandingPage() {
  return (
    <main className="relative -mx-4 min-h-[100dvh] overflow-hidden bg-[#0B1020] text-[#F8FAFC] md:-mx-6 lg:-mx-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#050816_0%,#0B1020_48%,#050816_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:32px_32px] opacity-25" />
        <div className="absolute inset-x-0 top-0 h-px bg-cyan-300/40" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-12 pt-8 md:px-6 md:pt-10 lg:px-8 lg:pb-16">
        <motion.header
          {...fadeUp}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center justify-between"
        >
          <PartrixLogo />
          <Link
            href="/login"
            className="hidden rounded-xl border border-cyan-200/20 bg-white/[0.04] px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-white/10 sm:inline-flex"
          >
            Sign in
          </Link>
        </motion.header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:gap-12">
          <motion.section
            {...fadeUp}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-100">
              The Operating System for Rental Businesses
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
              Run Your Rental Business From One Place.
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-[#94A3B8] sm:text-lg">
              Partrix helps rental businesses manage inventory, bookings, customers, logistics,
              payments, and operations from a single platform.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#22D3EE] px-6 text-base font-semibold text-[#050816] shadow-[0_8px_28px_rgba(34,211,238,0.32)] transition hover:bg-cyan-300"
              >
                Get Started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="#features"
                className="inline-flex h-14 items-center justify-center rounded-2xl border border-cyan-200/20 bg-white/[0.04] px-6 text-base font-semibold text-cyan-100 transition hover:bg-white/10"
              >
                Explore Features
              </Link>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.12 }}
            className="rounded-2xl border border-cyan-200/15 bg-white/[0.055] p-5 shadow-[0_24px_48px_rgba(5,8,22,0.55)] backdrop-blur-2xl"
            aria-label="Partrix operations preview"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Control center</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Today&apos;s operations</h2>
              </div>
              <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-100">
                Live
              </span>
            </div>

            <div className="grid gap-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-[#050816]/60 px-4 py-3"
                >
                  <div>
                    <p className="text-xs text-[#94A3B8]">{metric.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{metric.value}</p>
                  </div>
                  <span className="text-xs font-medium text-cyan-200">{metric.detail}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-cyan-200/10 bg-[#050816]/70 p-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#94A3B8]">
                <span>Rental pipeline</span>
                <span>Ready</span>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {[72, 48, 84, 62, 92].map((height, index) => (
                  <div key={height + index} className="flex h-28 items-end rounded-full bg-white/[0.04] p-1">
                    <div
                      className="w-full rounded-full bg-[#22D3EE]"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        </div>

        <motion.section
          id="features"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.2 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.24 + index * 0.05 }}
                className="rounded-2xl border border-cyan-200/10 bg-white/[0.04] p-5 backdrop-blur-sm"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <h2 className="mt-4 text-sm font-semibold text-white">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{feature.description}</p>
              </motion.article>
            );
          })}
        </motion.section>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="border-t border-cyan-200/10 pt-6 text-center text-xs text-[#94A3B8] sm:text-left"
        >
          Partrix. The Operating System for Rental Businesses.
        </motion.footer>
      </div>
    </main>
  );
}
