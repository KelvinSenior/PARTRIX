"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";
import AuthPrimaryButton from "@/components/auth/AuthPrimaryButton";

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  return (
    <form
      action="/api/auth/login"
      method="post"
      onSubmit={() => {
        setError(null);
        setIsSubmitting(true);
      }}
      className="space-y-5"
    >
      {error ? (
        <p className="rounded-xl border border-rose-300/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <AuthInput
        label="Work email"
        icon={Mail}
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@company.com"
      />

      <AuthInput
        label="Password"
        icon={Lock}
        name="password"
        type="password"
        required
        autoComplete="current-password"
        placeholder="Enter password"
      />

      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="inline-flex items-center gap-2 text-zinc-300">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-cyan-200/40 bg-slate-900 text-cyan-300 focus:ring-cyan-300/60"
          />
          Remember me
        </label>
        <Link href="/login" className="text-cyan-200 transition hover:text-cyan-100">
          Forgot password?
        </Link>
      </div>

      <AuthPrimaryButton isLoading={isSubmitting} label="Continue" loadingLabel="Signing in..." />
    </form>
  );
}
