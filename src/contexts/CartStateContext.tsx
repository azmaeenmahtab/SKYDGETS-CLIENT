"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  title: string;
  price: number; // in poisha
  image: string;
  quantity: number;
}

export type CartAction =
  | { type: "add"; payload: CartItem }
  | { type: "remove"; payload: { productId: string } }
  | { type: "updateQuantity"; payload: { productId: string; quantity: number } }
  | { type: "clear" };

// ── Reducer ───────────────────────────────────────────────────────────────────

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "add": {
      const existing = state.find(
        (item) => item.productId === action.payload.productId
      );
      if (existing) {
        return state.map((item) =>
          item.productId === action.payload.productId
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      }
      return [...state, action.payload];
    }
    case "remove":
      return state.filter(
        (item) => item.productId !== action.payload.productId
      );
    case "updateQuantity":
      return state.map((item) =>
        item.productId === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
    case "clear":
      return [];
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

/**
 * Cart state context — split from dispatch so read-only consumers
 * (e.g. cart count badge in Navbar) don't re-render on every dispatch.
 */
const CartStateContext = createContext<CartItem[]>([]);

export function CartStateProvider({
  children,
  dispatch,
  state,
}: {
  children: ReactNode;
  dispatch: React.Dispatch<CartAction>;
  state: CartItem[];
}) {
  return (
    <CartStateContext.Provider value={state}>
      {children}
    </CartStateContext.Provider>
  );
}

export { CartStateContext };

/**
 * Hook for reading cart items.
 * Must be used within CartStateContext.Provider.
 */
export function useCart(): CartItem[] {
  return useContext(CartStateContext);
}

export { cartReducer };
export type { CartItem as CartItemType };
