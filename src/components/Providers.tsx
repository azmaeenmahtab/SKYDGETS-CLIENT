"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { queryClient } from "@/lib/queryClient";
import { CartProvider } from "@/contexts/CartDispatchContext";
import { AuthProvider } from "@/contexts/AuthContext";

/**
 * Providers component — wraps the entire app in all required context providers.
 * Order matters: QueryClient → Auth → Cart (inner providers can use outer ones).
 *
 * HeroUI v3 note: no HeroUIProvider is required — components work directly
 * after importing @heroui/styles in globals.css.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
