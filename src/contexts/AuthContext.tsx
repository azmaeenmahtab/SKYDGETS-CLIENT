"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSession, signIn, signOut } from "@/lib/auth-client";

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

  const value: AuthContextValue = {
    user,
    status,
    login: () => {
      // Typically the UI handles this via standard redirects to /login, 
      // but we expose this if components want to trigger it.
      window.location.href = "/login";
    },
    logout: async () => {
      await signOut();
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
