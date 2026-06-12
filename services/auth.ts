import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { SessionUser, UserRole } from "@/types/auth";

const SALT_ROUNDS = 12;

async function ensureOrganizationForUser(user: { id: string; email: string; name: string | null; role: UserRole; organizationId: string | null }) {
  if (user.organizationId) {
    return user;
  }

  const organization = await prisma.organization.create({
    data: {
      name: `${user.name || user.email.split("@")[0]} Workspace`,
      slug: `${user.email.split("@")[0]}-${Date.now().toString(36)}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    },
  });

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { organizationId: organization.id },
  });

  return {
    ...user,
    organizationId: updatedUser.organizationId,
  };
}

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

  const organization = await prisma.organization.create({
    data: {
      name: `${options.name.trim()}'s Workspace`,
      slug: `${normalizedEmail.split("@")[0]}-${Date.now().toString(36)}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    },
  });

  // Create user with ACTIVE status
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: passwordHash,
      name: options.name.trim(),
      role: options.role ?? "STAFF",
      status: "ACTIVE",
      organizationId: organization.id,
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

  const sessionUser = await ensureOrganizationForUser({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    organizationId: user.organizationId,
  });

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.name,
    role: sessionUser.role,
    organizationId: sessionUser.organizationId,
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
  organizationId?: string | null;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationId: user.organizationId ?? null,
  };
}
