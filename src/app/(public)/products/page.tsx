import { serverFetch } from "@/lib/api/server-fetch";
import { ProductExplorer } from "@/components/products/ProductExplorer";
import type { GetProductsResponse } from "@/lib/api/products";
import type { Category } from "@/types/category";

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;

  // Build query string
  const query = new URLSearchParams();
  Object.entries(resolvedParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, v));
      } else {
        query.append(key, String(value));
      }
    }
  });

  const queryString = query.toString();

  // Server-side fetches (no browser auth — public endpoints)
  const [initialProducts, categories] = await Promise.all([
    serverFetch<GetProductsResponse>(`/products${queryString ? `?${queryString}` : ""}`),
    serverFetch<Category[]>(`/categories`),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Explore Products</h1>
      <p className="text-default-500 mb-6">
        Find premium resale gadgets, verified and graded for quality.
      </p>

      <ProductExplorer categories={categories} initialData={initialProducts} />
    </div>
  );
}
