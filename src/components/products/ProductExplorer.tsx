"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { getProducts, GetProductsResponse } from "@/lib/api/products";
import { FilterSidebar } from "./FilterSidebar";
import { SortDropdown } from "./SortDropdown";
import { ProductGrid } from "./ProductGrid";
import { Pagination } from "../common/Pagination";
import type { Category } from "@/types/category";
import { Loader2 } from "lucide-react";

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

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => getProducts(queryParams),
    initialData: searchParams.toString() === "" ? initialData : undefined,
    placeholderData: keepPreviousData,
  });

  const productsResponse = data || initialData;

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Sidebar */}
      <aside className="w-full md:w-64 md:min-w-[16rem] shrink-0 flex-shrink-0 md:sticky md:top-28">
        <FilterSidebar categories={categories} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 w-full flex flex-col gap-5 min-h-[600px]">
        {/* Toolbar */}
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 shadow-sm overflow-hidden">
          {/* Subtle loading bar top border indicator during filter transition */}
          {isFetching && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-primary to-violet-500 animate-pulse" />
          )}

          <div className="flex items-center gap-2">
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
            {isFetching && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary ml-1" />
            )}
          </div>

          <SortDropdown />
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={productsResponse.items}
          isLoading={isLoading}
          isFetching={isFetching}
        />

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
