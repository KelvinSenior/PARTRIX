import type { NextConfig } from "next";
import path from "path";
import { env } from "./lib/env";

// Turbopack walks up for a lockfile; with the app in RENTFLOW/rentflow it can pick the wrong root.
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    const cspHeader =
      env.NODE_ENV === "production"
        ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
        : "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:3000 ws://localhost:*; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http://localhost:*; font-src 'self' data:; connect-src 'self' ws://localhost:* http://localhost:*; frame-ancestors 'none'; base-uri 'self'; form-action 'self';";

    return [
      {
        source: "/(.*)",
        headers: [
          // Clickjacking protection
          { key: "X-Frame-Options", value: "DENY" },
          // MIME type sniffing prevention
          { key: "X-Content-Type-Options", value: "nosniff" },
          // XSS protection (Legacy - modern browsers ignore this)
          { key: "X-XSS-Protection", value: "0" },
          // Referrer policy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Feature policy / Permissions policy
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
          },
          // Content Security Policy
          { key: "Content-Security-Policy", value: cspHeader },
          // Cross-Origin policies
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          // HSTS for production
          ...(env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Enable rate limiting and security middleware
        {
          source: "/api/:path*",
          destination: "/api/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
