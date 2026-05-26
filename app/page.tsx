import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#040816] px-6 py-12 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 rounded-3xl border border-white/10 bg-slate-950/80 p-12 shadow-2xl sm:p-16">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">Welcome to RENTFLOW</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Premium Rental Operations for Event Teams</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            Manage bookings, inventory and finances with a secure, polished platform built for rental professionals.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/login" className="rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 px-5 py-4 text-center text-sm font-semibold text-white shadow-lg transition hover:opacity-95">
            Sign in
          </Link>
          <Link href="/signup" className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-center text-sm font-semibold text-slate-100 transition hover:bg-slate-900/90">
            Create account
          </Link>
          <Link href="/dashboard" className="rounded-2xl border border-white/6 bg-slate-800/70 px-5 py-4 text-center text-sm font-semibold text-slate-100 transition hover:bg-slate-800/80">
            View demo
          </Link>
        </div>
      </div>
    </main>
  );
}
