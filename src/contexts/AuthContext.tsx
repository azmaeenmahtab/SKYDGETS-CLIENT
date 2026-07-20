"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { mergeCart } from "@/lib/api/cart";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  avatarUrl?: string;
}

export type AuthStatus = "authenticated" | "unauthenticated" | "loading";

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: () => void;
  logout: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  status: "unauthenticated",
  login: () => {},
  logout: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const queryClient = useQueryClient();

  // Track previous auth state to detect login transition
  const prevStatusRef = useRef<AuthStatus>("loading");

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as any).role as "customer" | "admin",
        avatarUrl: session.user.image || undefined,
      }
    : null;

  const status: AuthStatus = isPending
    ? "loading"
    : session
    ? "authenticated"
    : "unauthenticated";

  // On login: merge guest cart into user cart, then refetch the ["cart"] query
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (prev !== "authenticated" && status === "authenticated") {
      // Transition from not-authenticated → authenticated
      // Call merge, then invalidate cart so it refetches the merged result
      mergeCart()
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["cart"] });
        })
        .catch(() => {
          // Merge failed (e.g. no guest cart exists) — still refetch cart
          queryClient.invalidateQueries({ queryKey: ["cart"] });
        });
    }
  }, [status, queryClient]);

  const value: AuthContextValue = {
    user,
    status,
    login: () => {
      window.location.href = "/login";
    },
    logout: async () => {
      await signOut();
      // Clear local cart cache on logout
      queryClient.setQueryData(["cart"], { items: [] });
      window.location.href = "/login";
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Hook to access auth state and actions.
 * Must be used within AuthProvider.
 */
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

export { AuthContext };
