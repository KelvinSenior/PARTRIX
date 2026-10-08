import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Partrix | Rental Business Management Software",
  description:
    "Run your rental business from one place. Manage inventory, bookings, customers, payments, deliveries, and daily operations with Partrix.",
  alternates: {
    canonical: "https://partrix.app",
  },
  openGraph: {
    title: "Partrix | Rental Business Management Software",
    description:
      "Manage inventory, bookings, customers, payments, and daily operations from one platform built for rental businesses.",
    url: "https://partrix.app",
    siteName: "Partrix",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Partrix | Rental Business Management Software",
    description:
      "Manage inventory, bookings, customers, payments, and daily operations from one platform built for rental businesses.",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
