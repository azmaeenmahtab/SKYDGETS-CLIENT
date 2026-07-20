import { serverFetch } from "@/lib/api/server-fetch";
import { ProductExplorer } from "@/components/products/ProductExplorer";
import type { GetProductsResponse } from "@/lib/api/products";
import type { Category } from "@/types/category";

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;

  // Build query string — categoryPath is single-select, send at most one value
  const query = new URLSearchParams();
  Object.entries(resolvedParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (key === "categoryPath") {
        // Single-select: only take the first value
        const single = Array.isArray(value) ? value[0] : value;
        if (single) query.set("categoryPath", single);
      } else if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, v));
      } else {
        query.append(key, String(value));
      }
    }
  });

  const queryString = query.toString();

  const [initialProducts, categories] = await Promise.all([
    serverFetch<GetProductsResponse>(`/products${queryString ? `?${queryString}` : ""}`),
    serverFetch<Category[]>(`/categories`),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Explore Products
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Premium resale gadgets — AI-graded, verified, and ready to ship.
        </p>
      </div>

      <ProductExplorer categories={categories} initialData={initialProducts} />
    </div>
  );
}
