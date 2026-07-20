"use client"; // 1. Must be a client component to use the authentication state hooks

import Link from "next/link";
import { authClient } from "@/lib/auth-client"; // 2. Import your established Better Auth client instance
import { useRouter } from "next/navigation";

/**
 * Minimal Navbar — structure only, polished design comes later.
 * Uses semantic HTML; HeroUI components will be layered in the design prompt.
 * Now dynamically monitors and adapts to the active user session.
 */
export function Navbar() {
  const router = useRouter();
  
  // 3. Destructure data, and loading state from Better Auth hook
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login"); // Redirect cleanly to login screen after logout
          router.refresh();
        },
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white"
        >
          SKYDGETS
        </Link>

        {/* Navigation links */}
        <div className="hidden items-center gap-6 sm:flex">
          <Link
            href="/products"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Explore
          </Link>
          <Link
            href="/cart"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Cart
          </Link>

          {/* 4. Conditional Rendering Logic */}
          {isPending ? (
            // Skeleton / Loading Placeholder state to avoid visual layout shifts
            <div className="h-8 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          ) : session ? (
            // Logged In Controls
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Hi, {session.user.name.split(" ")[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              >
                Sign Out
              </button>
            </div>
          ) : (
            // Logged Out Controls
            <Link
              href="/login"
              className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}