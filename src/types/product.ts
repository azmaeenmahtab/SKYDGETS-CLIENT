// Product type definitions — mirrors backend product.types.ts
// Prices stored as integers (poisha); use formatPrice() from lib/utils.ts for display.
export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  categoryPath: string;
  brand?: string;
  price: number; // integer paisa/poisha
  compareAtPrice?: number;
  condition: "new" | "like_new" | "good" | "fair" | "for_parts";
  attributes: Record<string, string | number | boolean>;
  images: ProductImage[];
  stock: number;
  status: "draft" | "published" | "archived" | "sold_out";
  source: "manual" | "ai_listing_assistant";
  ratingAvg: number;
  ratingCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}
