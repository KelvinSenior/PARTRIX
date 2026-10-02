import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { DomainError } from "@/lib/domainErrors";

export function apiError(
  message: string,
  status: number,
  details?: Record<string, unknown>,
) {
  return NextResponse.json({ message, details }, { status });
}

export function validationError(error: ZodError) {
  return apiError("Please check the highlighted fields.", 422, {
    fields: error.flatten().fieldErrors,
  });
}

export function apiErrorFromException(error: unknown, fallback: string, fallbackStatus = 500) {
  if (error instanceof DomainError) return apiError(error.message, error.status);
  return apiError(fallback, fallbackStatus);
}

export function prismaErrorCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

