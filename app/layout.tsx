import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import UiProvider from "@/components/ui/UiProvider";
import BottomNavWrapper from "@/components/dashboard/BottomNavWrapper";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "RENTFLOW",
  description: "Event rental management with secure authentication and role-based access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
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
