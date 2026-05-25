import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import UiProvider from "@/components/ui/UiProvider";
import BottomNavWrapper from "@/components/dashboard/BottomNavWrapper";

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
