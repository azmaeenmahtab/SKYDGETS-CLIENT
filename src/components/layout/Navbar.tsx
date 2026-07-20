"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Menu, X, ShoppingBag, Shield, LogOut } from "lucide-react";

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

  // Premium monochrome tab styling
  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-all relative py-1 ${
      isActive(path)
        ? "text-zinc-950 dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-zinc-950 dark:after:bg-white"
        : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
    }`;

  const mobileNavLinkClass = (path: string) =>
    `block text-base font-semibold px-4 py-2.5 rounded-xl transition-colors ${
      isActive(path) 
        ? "text-zinc-950 bg-zinc-100 dark:text-white dark:bg-zinc-900" 
        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
    }`;

  // Helper to extract clean initials if image fails
  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-850 dark:bg-zinc-950/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-black tracking-tight text-zinc-950 dark:text-white"
        >
          <span className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-2 py-1 rounded-lg text-xs font-black tracking-widest leading-none">
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
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-200 dark:border-zinc-800">
              <Link
                href="/admin/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-900 dark:text-zinc-100 rounded-lg transition-colors border border-zinc-200/50 dark:border-zinc-800"
              >
                <Shield className="w-3 h-3" /> Manage Items
              </Link>
              <Link
                href="/admin/ai-drafts"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg transition-colors"
              >
                <Shield className="w-3 h-3" /> AI Drafts
              </Link>
            </div>
          )}
        </div>

        {/* Desktop Auth Controls */}
        <div className="hidden items-center gap-4 md:flex">
          {isPending ? (
            <div className="h-8 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          ) : session ? (
            <div className="flex items-center gap-4">
              {/* Dynamic User Avatar Container */}
              <div className="flex items-center gap-2.5 px-2 py-1 rounded-full border border-zinc-200/60 bg-zinc-50/50 p-1 dark:border-zinc-800 dark:bg-zinc-900/40">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-950/10 dark:ring-white/10"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex w-7 h-7 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold">
                    {userInitial}
                  </div>
                )}
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 pr-1">
                  {session.user.name.split(" ")[0]}
                </span>
              </div>

              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 px-5 py-2 text-xs font-bold text-white dark:text-zinc-950 transition-all border border-transparent dark:border-white shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {session && (
            <Link
              href="/cart"
              className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white"
            >
              <ShoppingBag className="w-5.5 h-5.5" />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 px-4 py-4 space-y-1.5 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/")}>
            Home
          </Link>
          <Link href="/products" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/products")}>
            Explore Catalog
          </Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/about")}>
            About SKYDGETS
          </Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/contact")}>
            Contact Support
          </Link>

          {session && (
            <>
              <div className="h-px bg-zinc-200 dark:bg-zinc-850 my-2" />
              <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/cart")}>
                Shopping Cart
              </Link>
              <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/orders")}>
                My Orders
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <div className="h-px bg-zinc-200 dark:bg-zinc-850 my-2" />
              <p className="px-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
                Admin Settings
              </p>
              <Link href="/admin/products" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/admin/products")}>
                Manage Products
              </Link>
              <Link href="/admin/ai-drafts" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/admin/ai-drafts")}>
                AI Listing Drafts
              </Link>
            </>
          )}

          <div className="h-px bg-zinc-200 dark:bg-zinc-850 my-3" />

          {session ? (
            <div className="px-4 py-2 flex items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl">
              <div className="flex items-center gap-2">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-6 h-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex w-6 h-6 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[10px] font-bold">
                    {userInitial}
                  </div>
                )}
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  {session.user.name.split(" ")[0]}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <LogOut className="w-4 h-4" /> Out
              </button>
            </div>
          ) : (
            <div className="pt-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-black dark:text-zinc-950 font-bold py-2.5 rounded-xl text-sm transition-all"
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