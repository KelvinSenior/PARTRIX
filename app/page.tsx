import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 rounded-3xl border border-zinc-200 bg-white p-12 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 sm:p-16">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">RENTFLOW auth starter</p>
          <h1 className="text-4xl font-semibold tracking-tight">Secure rental management auth with Next.js and Prisma.</h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            Signup, login, protected app routes, role-based access, secure HTTP-only cookies, and middleware authentication for production-ready flow.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/login" className="rounded-2xl border border-zinc-200 bg-zinc-950 px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-zinc-800">
            Login
          </Link>
          <Link href="/signup" className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-center text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100">
            Sign up
          </Link>
          <Link href="/dashboard" className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-center text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100">
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
