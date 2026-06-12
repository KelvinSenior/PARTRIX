import LoginForm from "@/components/auth/LoginForm";
import AuthShell from "@/components/auth/AuthShell";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Welcome to Partrix"
      subtitle="The Operating System for Rental Businesses"
      cardTitle="Welcome back"
      cardSubtitle="Continue to your operational dashboard."
      footer={
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="h-px flex-1 bg-zinc-700/80" />
            <span className="text-xs uppercase tracking-[0.2em]">New to Partrix</span>
            <span className="h-px flex-1 bg-zinc-700/80" />
          </div>
          <Link href="/signup" className="inline-flex w-full justify-center rounded-xl border border-cyan-200/20 bg-white/5 px-4 py-3 font-medium text-cyan-100 transition hover:bg-white/10">
            Create account
          </Link>
        </div>
      }
    >
        <LoginForm initialError={params.error} />
    </AuthShell>
  );
}
