import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import UiProvider from "@/components/ui/UiProvider";
import BottomNavWrapper from "@/components/dashboard/BottomNavWrapper";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL("https://partrix.app"),
  title: "PARTRIX by SKS Labs | Rental Business Operating System",
  applicationName: "PARTRIX",
  description:
    "PARTRIX is a modern operating system for rental businesses, built by SKS Labs. It helps teams manage inventory, bookings, customers, deliveries, payments, and operations from one platform.",
  keywords: [
    "PARTRIX",
    "rental business software",
    "rental inventory management",
    "booking management",
    "rental operations platform",
    "rental business operating system",
    "SKS Labs",
    "Kelvin Senior Sarfo",
    "rental management software",
    "equipment rental software",
    "property rental management",
    "vehicle rental software",
    "rental platform",
  ],
  creator: "Kelvin Senior Sarfo",
  publisher: "SKS Labs",
  authors: [{ name: "Kelvin Senior Sarfo", url: "https://www.skslabs.dev/" }],
  alternates: {
    canonical: "https://partrix.app",
  },
  openGraph: {
    title: "PARTRIX by SKS Labs | Rental Business Operating System",
    description:
      "PARTRIX is a modern operating system for rental businesses, built by SKS Labs. It helps teams manage inventory, bookings, customers, deliveries, payments, and operations from one platform.",
    siteName: "PARTRIX",
    url: "https://partrix.app",
    images: [
      {
        url: "/brand/Partrix_Logo_icon-only-no_background.png",
        width: 512,
        height: 512,
        alt: "PARTRIX logo by SKS Labs",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PARTRIX by SKS Labs | Rental Business Operating System",
    description:
      "PARTRIX is a modern operating system for rental businesses, built by SKS Labs. It helps teams manage inventory, bookings, customers, deliveries, payments, and operations from one platform.",
    images: ["/brand/Partrix_Logo_icon-only-no_background.png"],
  },
  icons: {
    icon: [
      { url: "/brand/Partrix_Logo_icon-only-no_background.png", type: "image/png" },
    ],
    apple: [
      { url: "/brand/Partrix_Logo_icon-only-no_background.png", type: "image/png" },
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
