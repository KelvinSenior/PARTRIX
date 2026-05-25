import { z } from "zod";

export const customerPayloadSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(100, "First name cannot exceed 100 characters.")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes."),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(100, "Last name cannot exceed 100 characters.")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254, "Email cannot exceed 254 characters.")
    .optional()
    .nullable(),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s+\-().]*$/, "Phone number contains invalid characters.")
    .max(20, "Phone number cannot exceed 20 characters.")
    .optional()
    .nullable(),
  company: z
    .string()
    .trim()
    .max(200, "Company name cannot exceed 200 characters.")
    .optional()
    .nullable(),
  address: z
    .string()
    .trim()
    .max(500, "Address cannot exceed 500 characters.")
    .regex(/^[a-zA-Z0-9\s.,\-#/()]*$/, "Address contains invalid characters.")
    .optional()
    .nullable(),
  notes: z
    .string()
    .trim()
    .max(2000, "Notes cannot exceed 2000 characters.")
    .optional()
    .nullable(),
});

export type CustomerPayload = z.infer<typeof customerPayloadSchema>;
