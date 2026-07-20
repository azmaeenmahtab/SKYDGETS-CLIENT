"use client";

import { ProductCard } from "./ProductCard";
import { ProductSkeleton } from "./ProductSkeleton";
import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <ProductSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-default-50 border border-default-200 rounded-2xl">
        <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
        <p className="text-default-500 max-w-md">
          We couldn't find any gadgets matching your filter criteria. Try resetting or adjusting the filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
