/**
 * Error Logging & Monitoring for Production
 * Integrates with Vercel monitoring and can be extended with external services
 */

import { env } from "@/lib/env";

interface ErrorLogContext {
  userId?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  timestamp?: string;
  environment?: string;
}

/**
 * Log error to monitoring service
 * Integrates with Vercel monitoring + can extend to external services (Sentry, Datadog, etc.)
 */
export function logError(
  error: unknown,
  context: ErrorLogContext = {},
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  const logEntry = {
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    error: {
      message: errorObj.message,
      stack: errorObj.stack,
      name: errorObj.name,
    },
    context: {
      userId: context.userId || "anonymous",
      route: context.route || "unknown",
      method: context.method || "unknown",
      statusCode: context.statusCode || 500,
      ...context,
    },
  };

  // In production, send to monitoring service
  if (env.NODE_ENV === "production") {
    // Vercel automatically captures uncaught errors and logs them
    // You can extend this with external service:
    // await sendToSentry(logEntry);
    // await sendToDatadog(logEntry);
    console.error("[PRODUCTION_ERROR]", logEntry);
  } else {
    // Development logging
    console.error("[ERROR]", logEntry);
  }
}

/**
 * Log security events
 */
export function logSecurityEvent(
  eventType: "LOGIN_ATTEMPT" | "FAILED_LOGIN" | "UNAUTHORIZED_ACCESS" | "FILE_UPLOAD" | "ADMIN_ACTION",
  userId: string | null,
  details: Record<string, unknown>,
): void {
  if (!env.LOG_SECURITY_EVENTS) return;

  const event = {
    timestamp: new Date().toISOString(),
    eventType,
    userId,
    environment: env.NODE_ENV,
    ...details,
  };

  if (env.NODE_ENV === "production") {
    console.warn("[SECURITY_EVENT]", event);
  } else {
    console.log("[SECURITY_EVENT]", event);
  }
}

/**
 * Log performance metrics
 */
export function logPerformance(
  operation: string,
  durationMs: number,
  context?: Record<string, unknown>,
): void {
  if (durationMs > 1000) {
    // Log slow operations
    console.warn("[SLOW_OPERATION]", {
      operation,
      durationMs,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }
}

/**
 * Capture API response metrics
 */
export function logApiCall(
  method: string,
  route: string,
  statusCode: number,
  durationMs: number,
): void {
  // Log slow API calls
  if (durationMs > 1000) {
    console.warn("[SLOW_API]", {
      method,
      route,
      statusCode,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  }

  // Log errors
  if (statusCode >= 500) {
    console.error("[API_ERROR]", {
      method,
      route,
      statusCode,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Setup error boundaries and unhandled rejection logging
 */
export function setupErrorHandling(): void {
  if (typeof window === "undefined") return; // Server-side only

  // Log unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    logError(event.reason, {
      route: window.location.pathname,
      statusCode: 0,
    });
  });

  // Log uncaught errors
  window.addEventListener("error", (event) => {
    logError(event.error, {
      route: window.location.pathname,
      statusCode: 0,
    });
  });
}

/**
 * Initialize monitoring for production
 */
export function initializeMonitoring(): void {
  if (env.NODE_ENV === "production") {
    // Can integrate with external monitoring services here
    // Examples:
    // - Sentry: Sentry.init({ dsn: process.env.SENTRY_DSN })
    // - Datadog: dd_rum.init()
    // - LogRocket: LogRocket.init()
    // - Rollbar: Rollbar.init()

    console.log("[MONITORING] Production monitoring initialized");
  }
}

/**
 * Export error types for use in API routes
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(422, message, context);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = "Authentication required") {
    super(401, message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = "Insufficient permissions") {
    super(403, message);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter: number) {
    super(429, "Too many requests");
    this.context = { retryAfter };
    this.name = "RateLimitError";
  }
}
