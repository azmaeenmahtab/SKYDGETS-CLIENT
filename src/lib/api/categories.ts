/**
 * Category API helpers.
 * Uses the browser-side `apiGet` for client components,
 * and `serverFetch` directly for server components.
 */
import { apiGet } from "./client";
import type { Category } from "@/types/category";

export async function getCategories(): Promise<Category[]> {
  return apiGet<Category[]>("/categories");
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  return apiGet<Category>(`/categories/${slug}`);
}
