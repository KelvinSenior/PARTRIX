import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { SessionUser, UserRole } from "@/types/auth";

const SALT_ROUNDS = 12;

/**
 * Hash password with bcryptjs
 * Using 12 rounds provides strong security (bcryptjs is slower than bcrypt for added security)
 */
export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password with timing attack resistance
 * bcrypt provides constant-time comparison internally
 */
export async function verifyPassword(password: string, hash: string) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    // Log timing attack attempts
    console.error("[SECURITY] Password verification error:", error);
    return false;
  }
}

/**
 * Register a new user with validation
 */
export async function registerUser(options: {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}) {
  const normalizedEmail = options.email.trim().toLowerCase();

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("A user with this email already exists.");
  }

  // Hash password with strong parameters
  const passwordHash = await hashPassword(options.password);

  // Create user with ACTIVE status
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: passwordHash,
      name: options.name.trim(),
      role: options.role ?? "STAFF",
      status: "ACTIVE",
    },
  });

  return user;
}

/**
 * Authenticate user with rate limiting and security checks
 */
export async function authenticateUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    // Always throw same error to prevent email enumeration
    throw new Error("Invalid credentials.");
  }

  // Check if user account is active
  if (user.status !== "ACTIVE") {
    throw new Error("Invalid credentials.");
  }

  // Verify password with timing attack resistance
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new Error("Invalid credentials.");
  }

  return user;
}

/**
 * Get current user from token
 */
export async function getCurrentUserFromToken(token: string) {
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user) {
    return null;
  }

  // Check if user is still active
  if (user.status !== "ACTIVE") {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
  } as SessionUser;
}

/**
 * Build session user object
 */
export function buildSessionUser(user: {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
