import { z } from "zod";

// Production-grade password policy
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]{12,}$/;
const passwordErrorMsg =
  "Password must be at least 12 characters and contain uppercase, lowercase, number, and special character (@$!%*?&^#).";

export const signupPayloadSchema = z.object({
  organizationName: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(1, "Business name is required.").max(100, "Business name cannot exceed 100 characters.").optional(),
  ),
  invitationToken: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().regex(/^[a-f0-9]{64}$/, "Invalid invitation.").optional(),
  ),
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name cannot exceed 100 characters.")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254, "Email cannot exceed 254 characters.")
    .toLowerCase(),
  password: z
    .string()
    .regex(passwordRegex, passwordErrorMsg)
    .refine(
      (password) => !isCommonPassword(password),
      "This password is too common. Choose a more unique password.",
    ),
}).superRefine((payload, context) => {
  if (!payload.invitationToken && !payload.organizationName) {
    context.addIssue({ code: "custom", path: ["organizationName"], message: "Business name is required." });
  }
});

export const loginPayloadSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z.string().min(1, "Password is required."),
});

// Common passwords to block
const commonPasswords = new Set([
  "password", "123456", "12345678", "qwerty", "abc123", "monkey", "1234567", "letmein", "trustno1",
  "dragon", "baseball", "111111", "iloveyou", "master", "sunshine", "ashley", "bailey", "princess",
  "passw0rd", "shadow", "123123", "654321", "superman", "qazwsx", "123321", "hello123", "admin123",
]);

function isCommonPassword(password: string): boolean {
  const lower = password.toLowerCase();
  if (commonPasswords.has(lower)) return true;

  // Check for sequential numbers
  if (/012|123|234|345|456|567|678|789|890/.test(password)) return true;

  // Check for repeated characters
  if (/(.)\1{3,}/.test(password)) return true;

  // Check for patterns like qwerty, asdf
  const patterns = ["qwerty", "asdfgh", "zxcvbn", "qwert", "asdfg", "zxcvb", "1234", "5678"];
  if (patterns.some((p) => lower.includes(p))) return true;

  return false;
}
