"use client";

import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
  type Dispatch,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartApi,
} from "@/lib/api/cart";
import {
  CartStateContext,
  type CartAction,
  type CartItem,
} from "./CartStateContext";
import type { CartResponse } from "@/types/cart";

// ── Context ───────────────────────────────────────────────────────────────────

/**
 * Cart dispatch context — exposes mutation functions backed by TanStack Query.
 * Stable reference: these functions don't change on re-render.
 */
const CartDispatchContext = createContext<Dispatch<CartAction>>(() => {});

// ── CartMutations hook ────────────────────────────────────────────────────────

export interface CartMutations {
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartMutationsContext = createContext<CartMutations>({
  addItem: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  isLoading: false,
});

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * CartProvider:
 * - Fetches cart from server via TanStack Query (["cart"] key)
 * - Populates CartStateContext from query data
 * - Provides mutation functions that call the API then invalidate ["cart"]
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch cart from server — this is the single source of truth
  const { data: cartData } = useQuery<CartResponse>({
    queryKey: ["cart"],
    queryFn: fetchCart,
    staleTime: 30_000, // 30s — don't refetch on every focus
    retry: false, // don't retry on 401 (guest with no cookie yet is fine)
  });

  // Map server cart items to CartItem shape for CartStateContext
  const cartItems: CartItem[] = (cartData?.items ?? []).map((item) => ({
    productId: item.productId,
    title: item.title,
    price: item.priceAtAdd,
    image: item.image,
    quantity: item.quantity,
  }));

  const invalidateCart = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    [queryClient]
  );

  const addMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      addCartItem(productId, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      updateCartItem(productId, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeCartItem(productId),
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearCartApi,
    onSuccess: () => {
      queryClient.setQueryData(["cart"], { items: [] });
    },
  });

  const mutations: CartMutations = {
    addItem: async (productId, quantity) => {
      await addMutation.mutateAsync({ productId, quantity });
    },
    updateQuantity: async (productId, quantity) => {
      await updateMutation.mutateAsync({ productId, quantity });
    },
    removeItem: async (productId) => {
      await removeMutation.mutateAsync(productId);
    },
    clearCart: async () => {
      await clearMutation.mutateAsync();
    },
    isLoading:
      addMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending ||
      clearMutation.isPending,
  };

  // Legacy dispatch compatibility — used by some existing components (cart page currently)
  // Maps CartAction dispatch calls to the mutation functions
  const legacyDispatch = useCallback(
    (action: CartAction) => {
      switch (action.type) {
        case "add":
          addMutation.mutate({
            productId: action.payload.productId,
            quantity: action.payload.quantity,
          });
          break;
        case "remove":
          removeMutation.mutate(action.payload.productId);
          break;
        case "updateQuantity":
          updateMutation.mutate({
            productId: action.payload.productId,
            quantity: action.payload.quantity,
          });
          break;
        case "clear":
          clearMutation.mutate();
          break;
      }
    },
    [addMutation, removeMutation, updateMutation, clearMutation]
  );

  return (
    <CartDispatchContext.Provider value={legacyDispatch}>
      <CartMutationsContext.Provider value={mutations}>
        <CartStateContext.Provider value={cartItems}>
          {children}
        </CartStateContext.Provider>
      </CartMutationsContext.Provider>
    </CartDispatchContext.Provider>
  );
}

/**
 * Hook for dispatching cart actions (legacy API, still works).
 * Must be used within CartProvider.
 */
export function useCartDispatch(): Dispatch<CartAction> {
  return useContext(CartDispatchContext);
}

/**
 * Hook for cart mutation functions with loading state.
 * Preferred over useCartDispatch for new components.
 */
export function useCartMutations(): CartMutations {
  return useContext(CartMutationsContext);
}

export { CartDispatchContext };
export type { CartAction, CartItem };
