import { NextResponse } from "next/server";
import type { ZodError } from "zod";

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

export function prismaErrorCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

