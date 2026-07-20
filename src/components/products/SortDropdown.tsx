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
      <span className="text-sm text-default-500 whitespace-nowrap">Sort by:</span>
      <select
        value={currentSort}
        onChange={handleSortChange}
        disabled={isPending}
        className="bg-default-50 border border-default-200 text-default-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 outline-none cursor-pointer"
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
