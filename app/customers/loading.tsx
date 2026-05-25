import Skeleton from "@/components/ui/Skeleton";

export default function CustomersLoading() {
  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-6 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <Skeleton className="h-28" />
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
      </div>
    </main>
  );
}
