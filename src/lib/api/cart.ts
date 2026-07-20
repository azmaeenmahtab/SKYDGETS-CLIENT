import { apiGet, apiPost, apiPatch, apiDelete } from "./client";
import type { CartResponse } from "@/types/cart";

export async function fetchCart(): Promise<CartResponse> {
  return apiGet<CartResponse>("/cart");
}

export async function addCartItem(
  productId: string,
  quantity: number
): Promise<CartResponse> {
  return apiPost<CartResponse>("/cart/items", { productId, quantity });
}

export async function updateCartItem(
  productId: string,
  quantity: number
): Promise<CartResponse> {
  return apiPatch<CartResponse>(`/cart/items/${productId}`, { quantity });
}

export async function removeCartItem(productId: string): Promise<CartResponse> {
  return apiDelete<CartResponse>(`/cart/items/${productId}`);
}

export async function clearCart(): Promise<void> {
  return apiDelete<void>("/cart");
}

export async function mergeCart(): Promise<CartResponse> {
  return apiPost<CartResponse>("/cart/merge", {});
}
