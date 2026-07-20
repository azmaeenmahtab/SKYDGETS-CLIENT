"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import {
  cartReducer,
  CartStateContext,
  type CartAction,
  type CartItem,
} from "./CartStateContext";

// ── Context ───────────────────────────────────────────────────────────────────

/**
 * Cart dispatch context — stable reference so components that only dispatch
 * (e.g. "Add to cart" button) don't re-render when cart items change.
 */
const CartDispatchContext = createContext<Dispatch<CartAction>>(() => {});

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * CartProvider wraps both state and dispatch contexts.
 * Use this in Providers.tsx — it is the single provider for the cart.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, []);

  return (
    <CartDispatchContext.Provider value={dispatch}>
      <CartStateContext.Provider value={state}>
        {children}
      </CartStateContext.Provider>
    </CartDispatchContext.Provider>
  );
}

/**
 * Hook for dispatching cart actions.
 * Must be used within CartDispatchContext.Provider.
 */
export function useCartDispatch(): Dispatch<CartAction> {
  return useContext(CartDispatchContext);
}

export { CartDispatchContext };
export type { CartAction, CartItem };
