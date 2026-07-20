"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { Toaster } from "react-hot-toast"; // 1. Import the global notification container
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
        <CartProvider>
          {/* 2. Place Toaster here so it works nicely inside all context logic */}
          <Toaster 
            position="top-center" 
            reverseOrder={false}
            toastOptions={{
              // Premium dark/light adjustments to match the SKYDGETS design profile
              className: "dark:bg-zinc-900 dark:text-zinc-100 border dark:border-zinc-800 text-sm font-medium rounded-xl shadow-xl",
              duration: 4000,
            }}
          />
          {children}
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}