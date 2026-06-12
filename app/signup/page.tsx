import SignupForm from "@/components/auth/SignupForm";
import AuthShell from "@/components/auth/AuthShell";
import Link from "next/link";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Welcome to Partrix"
      subtitle="The Operating System for Rental Businesses"
      cardTitle="Create your workspace"
      cardSubtitle="Complete the steps to launch your premium rental operations workspace."
      footer={
        <p className="text-zinc-300">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-cyan-100 transition hover:text-cyan-200">
            Sign in
          </Link>
          .
        </p>
      }
    >
        <SignupForm initialError={params.error} />
    </AuthShell>
  );
}
