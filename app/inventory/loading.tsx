export default function InventoryLoading() {
  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-6 dark:bg-black sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <div className="h-36 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-900" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-900"
            />
          ))}
        </div>
        <div className="h-32 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-900" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-900"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

