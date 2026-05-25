"use server";

import { revalidatePath } from "next/cache";
import { setAuthCookie, clearAuthCookie } from "@/lib/cookies";
import { signToken } from "@/lib/jwt";
import { authenticateUser, registerUser } from "@/services/auth";
import { UserRole } from "@/types/auth";
import { loginPayloadSchema, signupPayloadSchema } from "@/lib/authValidation";

type AuthActionResult = {
  success: true;
};

function getFirstValidationMessage(error: unknown) {
  if (error && typeof error === "object" && "errors" in error) {
    const first = (error as any).errors?.[0];
    return first?.message ?? "Invalid input.";
  }
  return "Invalid input.";
}

export async function signupAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = signupPayloadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    throw new Error(getFirstValidationMessage(parsed.error));
  }

  const user = await registerUser(parsed.data);

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role as UserRole,
  });

  await setAuthCookie(token);
  revalidatePath("/");
  return { success: true };
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = loginPayloadSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    throw new Error(getFirstValidationMessage(parsed.error));
  }

  const user = await authenticateUser(parsed.data.email, parsed.data.password);
  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role as UserRole,
  });

  await setAuthCookie(token);
  revalidatePath("/");
  return { success: true };
}

export async function logoutAction() {
  const { redirect } = await import("next/navigation");

  await clearAuthCookie();
  revalidatePath("/");
  redirect("/login");
}
