/**
 * Security utilities for Partrix
 * Production-grade security functions for authentication, validation, and protection
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * CORS configuration for API endpoints
 * Restricts API access to same-origin requests
 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.NODE_ENV === "production" ? process.env.ALLOWED_ORIGIN || "https://partrix.app" : "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

/**
 * Handle CORS preflight requests
 */
export function handleCORS(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }
}

/**
 * Validate that request origin matches allowed origins
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const allowedOrigins = process.env.NODE_ENV === "production" 
    ? [process.env.ALLOWED_ORIGIN || "https://partrix.app"]
    : ["http://localhost:3001", "http://localhost:3000"];

  if (!origin) return true; // Allow same-site requests
  return allowedOrigins.includes(origin);
}

/**
 * Sanitize error messages to prevent information disclosure
 * Returns generic message in production, detailed in development
 */
export function sanitizeErrorMessage(error: unknown, isDevelopment: boolean = false): string {
  if (isDevelopment && error instanceof Error) {
    return error.message;
  }

  // Generic message for production
  return "An error occurred. Please try again later.";
}

/**
 * Rate limit configuration constants
 */
export const RATE_LIMIT_CONFIG = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 uploads
  },
};

/**
 * Validate file upload security
 * Checks MIME type, size, and prevents directory traversal
 */
export function validateFileUpload(
  file: File,
  allowedTypes: Set<string> | Map<string, string>,
  maxSize: number,
): { valid: boolean; error?: string } {
  const types = allowedTypes instanceof Map ? new Set(allowedTypes.keys()) : allowedTypes;

  // Check MIME type
  if (!types.has(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${Array.from(types).join(", ")}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  // Prevent path traversal in filename
  if (file.name.includes("..") || file.name.includes("/") || file.name.includes("\\")) {
    return {
      valid: false,
      error: "Invalid filename",
    };
  }

  return { valid: true };
}

/**
 * Prevent timing attacks by constant-time comparison
 * (Note: bcrypt already provides this for password hashing)
 */
export async function constantTimeCompare(a: string, b: string): Promise<boolean> {
  if (a.length !== b.length) {
    // Still perform dummy operation to maintain constant time
    await new Promise((resolve) => setTimeout(resolve, 10));
    return false;
  }

  let match = true;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      match = false;
    }
  }

  return match;
}

/**
 * Generate secure random tokens for CSRF and other purposes
 */
export async function generateSecureToken(length: number = 32): Promise<string> {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate IP address format
 */
export function isValidIP(ip: string): boolean {
  // IPv4
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 (simplified)
  const ipv6 = /^([a-f0-9:]+)$/i;

  return ipv4.test(ip) || ipv6.test(ip);
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate and sanitize search queries
 */
export function sanitizeSearchQuery(query: string, maxLength: number = 255): string {
  return query
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"'`]/g, "")
    .replace(/\*/g, "%");
}

/**
 * Log security events (for audit trail)
 * In production, this should be sent to a security logging service
 */
export async function logSecurityEvent(
  eventType: "LOGIN_ATTEMPT" | "FAILED_LOGIN" | "UNAUTHORIZED_ACCESS" | "FILE_UPLOAD" | "DATA_EXPORT",
  userId: string | null,
  details: Record<string, unknown>,
): Promise<void> {
  const event = {
    timestamp: new Date().toISOString(),
    eventType,
    userId,
    ...details,
  };

  // TODO: Send to security logging service (e.g., Datadog, Splunk, etc.)
  if (process.env.NODE_ENV === "development") {
    console.log("[SECURITY EVENT]", event);
  }
}
