import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

const mergeClasses = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 rounded-[32px] border border-zinc-200/80 bg-white/90 p-3 text-sm shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/80">
      {pages.map((page) => {
        const separator = basePath.includes("?") ? "&" : "?";
        return (
          <Link
            key={page}
            href={`${basePath}${separator}page=${page}`}
            className={mergeClasses(
              "inline-flex min-w-[2.5rem] items-center justify-center rounded-2xl px-3 py-2 transition",
              page === currentPage ? "bg-sky-600 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
            )}
          >
            {page}
          </Link>
        );
      })}
    </nav>
  );
}
