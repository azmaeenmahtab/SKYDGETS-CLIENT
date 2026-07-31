"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "newest") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }

    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-500 font-medium whitespace-nowrap">Sort by:</span>
      <select
        value={currentSort}
        onChange={handleSortChange}
        disabled={isPending}
        className="bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl px-3 py-1.5 font-medium outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 block p-2 cursor-pointer shadow-sm"
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
