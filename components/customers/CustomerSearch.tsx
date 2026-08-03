"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

export default function CustomerSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    router.push(`/customers?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="sticky top-4 z-20 flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white/95 p-3 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center dark:border-zinc-800/80 dark:bg-zinc-950/90">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Search customers by name, email, company..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full"
        />
      </div>
      <Button type="submit" variant="secondary" className="sm:w-auto">
        Search
      </Button>
    </form>
  );
}
