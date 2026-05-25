import SignupForm from "@/components/auth/SignupForm";
import Link from "next/link";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-950 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <section className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Create account</p>
          <h1 className="text-3xl font-semibold">Start your RENTFLOW account</h1>
          <p className="max-w-xl mx-auto text-zinc-600 dark:text-zinc-400">
            Secure signup with strong password hashing and JWT-based session cookies.
          </p>
        </section>

        <SignupForm initialError={params.error} />

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already registered? <Link href="/login" className="font-semibold text-black dark:text-white">Sign in</Link>.
        </p>
      </div>
    </main>
  );
}
