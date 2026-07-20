/**
 * Frontend cart types — serialized (ObjectIds become strings).
 * The populated cart item carries both priceAtAdd (snapshot) and currentPrice (live),
 * so the UI can show a "price may have changed" warning.
 */

export interface CartItemPopulated {
  productId: string;
  quantity: number;
  priceAtAdd: number; // price when added to cart (in poisha)
  addedAt: string; // ISO date string
  // Live product data populated by the backend
  title: string;
  image: string;
  currentPrice: number; // current product price (in poisha) — may differ from priceAtAdd
  stock: number;
  condition: string;
}

export interface CartResponse {
  items: CartItemPopulated[];
}
