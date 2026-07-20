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

  // Convert searchParams to an object/record of queries for fetching
  const categoryPaths = searchParams.getAll("categoryPath");
  const conditions = searchParams.getAll("condition");
  const minPrice = searchParams.get("minPrice") || undefined;
  const maxPrice = searchParams.get("maxPrice") || undefined;
  const sort = searchParams.get("sort") || undefined;
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || undefined;

  const queryParams = {
    categoryPath: categoryPaths,
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
    <div className="flex flex-col md:flex-row gap-8 py-6">
      {/* Sidebar - Filters */}
      <aside className="w-full md:w-1/4 shrink-0">
        <FilterSidebar categories={categories} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-default-500 text-sm">
            Showing <span className="font-semibold text-default-800">{productsResponse.items.length}</span> of{" "}
            <span className="font-semibold text-default-800">{productsResponse.total}</span> products
          </div>
          <SortDropdown />
        </div>

        {/* Product Grid */}
        <ProductGrid products={productsResponse.items} isLoading={isLoading} />

        {/* Pagination */}
        <Pagination page={productsResponse.page} totalPages={productsResponse.totalPages} />
      </main>
    </div>
  );
}
