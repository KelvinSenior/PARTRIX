"use client";

import { useState } from "react";

export default function SignupForm({ initialError }: { initialError?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  return (
    <form
      action="/api/auth/signup"
      method="post"
      onSubmit={() => {
        setError(null);
        setIsSubmitting(true);
      }}
      className="space-y-6 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm"
    >
      <h1 className="text-2xl font-semibold">Create your account</h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Full name
        <input
          name="name"
          type="text"
          required
          className="rounded-md border border-zinc-200 p-3 outline-none transition focus:border-black"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Email
        <input
          name="email"
          type="email"
          required
          className="rounded-md border border-zinc-200 p-3 outline-none transition focus:border-black"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="rounded-md border border-zinc-200 p-3 outline-none transition focus:border-black"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center rounded-md bg-black px-5 text-sm font-semibold text-white transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
