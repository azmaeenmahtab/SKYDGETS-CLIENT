"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { getProducts, GetProductsResponse } from "@/lib/api/products";
import { FilterSidebar } from "./FilterSidebar";
import { SortDropdown } from "./SortDropdown";
import { ProductGrid } from "./ProductGrid";
import { Pagination } from "../common/Pagination";
import type { Category } from "@/types/category";

interface ProductExplorerProps {
  categories: Category[];
  initialData: GetProductsResponse;
}

export function ProductExplorer({ categories, initialData }: ProductExplorerProps) {
  const searchParams = useSearchParams();

  // categoryPath is single-select — get only one value
  const categoryPath = searchParams.get("categoryPath") || undefined;
  const conditions = searchParams.getAll("condition");
  const minPrice = searchParams.get("minPrice") || undefined;
  const maxPrice = searchParams.get("maxPrice") || undefined;
  const sort = searchParams.get("sort") || undefined;
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || undefined;

  const queryParams = {
    categoryPath,
    condition: conditions,
    minPrice,
    maxPrice,
    sort,
    page,
    search,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => getProducts(queryParams),
    initialData: searchParams.toString() === "" ? initialData : undefined,
  });

  const productsResponse = data || initialData;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <FilterSidebar categories={categories} />
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col gap-5 min-w-0">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Showing{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">
              {productsResponse.items.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">
              {productsResponse.total}
            </span>{" "}
            products
          </p>
          <SortDropdown />
        </div>

        {/* Product Grid */}
        <ProductGrid products={productsResponse.items} isLoading={isLoading} />

        {/* Pagination */}
        {productsResponse.totalPages > 1 && (
          <Pagination
            page={productsResponse.page}
            totalPages={productsResponse.totalPages}
          />
        )}
      </main>
    </div>
  );
}
