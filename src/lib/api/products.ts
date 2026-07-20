import { apiGet, apiPost, apiPatch, apiDelete } from "./client";
import type { Product } from "@/types/product";

export interface GetProductsResponse {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getProducts(params: Record<string, any> = {}): Promise<GetProductsResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (key === "categoryPath") {
        // Single-select: only set one value
        const single = Array.isArray(value) ? value[0] : value;
        if (single) query.set("categoryPath", String(single));
      } else if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, String(v)));
      } else {
        query.append(key, String(value));
      }
    }
  });

  const queryString = query.toString();
  return apiGet<GetProductsResponse>(`/products${queryString ? `?${queryString}` : ""}`);
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return apiGet<Product>(`/products/${slug}`);
}

export async function createProduct(input: any): Promise<Product> {
  return apiPost<Product>("/products", input);
}

export async function updateProduct(id: string, input: any): Promise<Product> {
  return apiPatch<Product>(`/products/${id}`, input);
}

export async function deleteProduct(id: string): Promise<void> {
  return apiDelete<void>(`/products/${id}`);
}
