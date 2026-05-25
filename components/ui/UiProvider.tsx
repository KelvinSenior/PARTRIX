"use client";

import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./ErrorBoundary";

export default function UiProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "1rem",
            background: "rgba(15, 23, 42, 0.95)",
            color: "#f8fafc",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.25)",
          },
        }}
      />
    </ErrorBoundary>
  );
}
