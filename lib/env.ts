import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters."),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().positive().default(60),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(10),
  ALLOWED_ORIGIN: z.string().optional(),
  NEXT_PUBLIC_API_URL: z.string().optional(),
  LOG_SECURITY_EVENTS: z.enum(["true", "false"]).default("true"),
  SESSION_TIMEOUT_MINUTES: z.coerce.number().int().positive().default(10080), // 7 days
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment variables: ${issues}`);
}

export const env = parsedEnv.data;
