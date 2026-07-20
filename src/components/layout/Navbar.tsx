"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Menu, X, ShoppingBag, Shield, LogOut, Info, Mail } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setMobileMenuOpen(false);
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  const isAdmin = session?.user?.role === "admin";

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      isActive(path)
        ? "text-primary border-b-2 border-primary pb-1"
        : "text-zinc-600 dark:text-zinc-400"
    }`;

  const mobileNavLinkClass = (path: string) =>
    `block text-base font-semibold px-4 py-2.5 rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
      isActive(path) ? "text-primary bg-primary/5" : "text-zinc-700 dark:text-zinc-300"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 shadow-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-950 dark:text-white"
        >
          <span className="bg-primary text-white p-1.5 rounded-lg text-xs font-black tracking-widest leading-none">
            SD
          </span>
          SKYDGETS
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className={navLinkClass("/")}>
            Home
          </Link>
          <Link href="/products" className={navLinkClass("/products")}>
            Explore
          </Link>
          <Link href="/about" className={navLinkClass("/about")}>
            About
          </Link>
          <Link href="/contact" className={navLinkClass("/contact")}>
            Contact
          </Link>

          {/* Logged-in Customer Links */}
          {session && (
            <>
              <Link href="/cart" className={navLinkClass("/cart")}>
                Cart
              </Link>
              <Link href="/orders" className={navLinkClass("/orders")}>
                Orders
              </Link>
            </>
          )}

          {/* Admin specific controls */}
          {isAdmin && (
            <div className="flex items-center gap-4 pl-4 border-l border-zinc-200 dark:border-zinc-850">
              <Link
                href="/admin/products"
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors"
              >
                <Shield className="w-3 h-3 text-primary" /> Manage Items
              </Link>
              <Link
                href="/admin/ai-drafts"
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 bg-primary/10 hover:bg-primary/15 text-primary rounded-lg transition-colors"
              >
                <Shield className="w-3 h-3" /> AI Drafts
              </Link>
            </div>
          )}
        </div>

        {/* Desktop Auth Controls */}
        <div className="hidden items-center gap-4 md:flex">
          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200/50 dark:border-zinc-800">
                Hi, {session.user.name.split(" ")[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 dark:hover:text-red-500 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-primary hover:bg-primary/95 px-5 py-2 text-xs font-semibold text-white transition-all shadow-md hover:shadow-primary/10"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-3 md:hidden">
          {session && (
            <Link
              href="/cart"
              className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 relative"
            >
              <ShoppingBag className="w-5.5 h-5.5" />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 px-4 py-4 space-y-2 shadow-inner">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass("/")}
          >
            Home
          </Link>
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass("/products")}
          >
            Explore Catalog
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass("/about")}
          >
            About SKYDGETS
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass("/contact")}
          >
            Contact Support
          </Link>

          {session && (
            <>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/cart")}
              >
                Shopping Cart
              </Link>
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/orders")}
              >
                My Orders
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
              <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Admin Panel
              </p>
              <Link
                href="/admin/products"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/admin/products")}
              >
                Manage Products
              </Link>
              <Link
                href="/admin/ai-drafts"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass("/admin/ai-drafts")}
              >
                AI Listing Drafts
              </Link>
            </>
          )}

          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

          {session ? (
            <div className="px-4 py-2 flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-zinc-500">
                Logged in as <strong className="text-zinc-950 dark:text-white">{session.user.name.split(" ")[0]}</strong>
              </span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="px-4 py-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full bg-primary hover:bg-primary/95 text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}