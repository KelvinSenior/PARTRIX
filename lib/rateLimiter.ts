import { env } from "@/lib/env";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const remoteAddress = request.headers.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if (remoteAddress) {
    return remoteAddress;
  }

  return "unknown";
}

export function enforceRateLimit(request: Request, key: string) {
  const ip = getRequestIp(request);
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const windowMs = env.RATE_LIMIT_WINDOW_SECONDS * 1000;
  const entry = rateLimitStore.get(bucketKey);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(bucketKey, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: env.RATE_LIMIT_MAX_REQUESTS - 1,
      resetAt: now + windowMs,
    };
  }

  if (entry.count >= env.RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      resetAt: entry.resetAt,
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: env.RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetAt: entry.resetAt,
  };
}
