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
    <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
      <Input
        type="text"
        placeholder="Search customers by name, email, company..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" variant="secondary">
        Search
      </Button>
    </form>
  );
}
