import Link from "next/link";

interface CustomerCardProps {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  company: string | null;
  phone: string | null;
}

export default function CustomerCard({ id, firstName, lastName, email, company, phone }: CustomerCardProps) {
  return (
    <Link href={`/customers/${id}`}>
      <div className="rounded-[24px] border border-zinc-200/80 bg-white/95 p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950/85">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
              {firstName} {lastName}
            </h3>
            {company && <p className="text-sm text-zinc-600 dark:text-zinc-400">{company}</p>}
            {email && <p className="text-sm text-zinc-500 dark:text-zinc-400">{email}</p>}
            {phone && <p className="text-sm text-zinc-500 dark:text-zinc-400">{phone}</p>}
          </div>
          <div className="text-right">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-sky-100 text-sm font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
              {firstName[0]}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
