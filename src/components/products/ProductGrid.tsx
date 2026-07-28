"use client";

import { PackageOpen } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ProductSkeleton } from "./ProductSkeleton";
import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isFetching?: boolean;
}

export function ProductGrid({ products, isLoading, isFetching }: ProductGridProps) {
  if (isLoading && (!products || products.length === 0)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start w-full">
        {Array.from({ length: 8 }).map((_, idx) => (
          <ProductSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl min-h-[450px] w-full shadow-sm">
        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <PackageOpen className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
        </div>
        <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-2">
          No Products Found
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md text-sm leading-relaxed">
          We couldn't find any gadgets matching your filter criteria. Try resetting or adjusting the filters.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start w-full transition-opacity duration-300 ${
        isFetching ? "opacity-60 pointer-events-none" : "opacity-100"
      }`}
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
