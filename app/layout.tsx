import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import UiProvider from "@/components/ui/UiProvider";
import BottomNavWrapper from "@/components/dashboard/BottomNavWrapper";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL("https://partrix.app"),
  title: "Partrix — The Operating System for Rental Businesses",
  applicationName: "Partrix",
  description:
    "Partrix helps rental businesses manage inventory, bookings, customers, logistics, payments, and daily operations from one centralized platform.",
  keywords: [
    "rental business software",
    "rental inventory management",
    "booking management",
    "rental operations platform",
    "Partrix",
  ],
  creator: "Partrix",
  publisher: "Partrix",
  openGraph: {
    title: "Partrix — The Operating System for Rental Businesses",
    description:
      "Partrix helps rental businesses manage inventory, bookings, customers, logistics, payments, and daily operations from one centralized platform.",
    siteName: "Partrix",
    images: [
      {
        url: "/brand/partrix-logo-light.png",
        width: 746,
        height: 559,
        alt: "Partrix logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Partrix — The Operating System for Rental Businesses",
    description:
      "Partrix helps rental businesses manage inventory, bookings, customers, logistics, payments, and daily operations from one centralized platform.",
    images: ["/brand/partrix-logo-light.png"],
  },
  icons: {
    icon: [
      { url: "/brand/partrix-icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/brand/partrix-icon.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <UiProvider>
            <div className="flex-1 w-full px-4 md:px-6 lg:px-8">{children}</div>
            <BottomNavWrapper />
          </UiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
