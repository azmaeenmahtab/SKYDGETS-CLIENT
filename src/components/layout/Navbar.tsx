"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Menu, X, ShoppingBag, Shield, LogOut, Sparkles } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  // Floating Island Nav Link Styling
  const navLinkClass = (path: string) =>
    `relative px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
      isActive(path)
        ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md"
        : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900/80"
    }`;

  const mobileNavLinkClass = (path: string) =>
    `flex items-center justify-between text-sm font-semibold px-4 py-3 rounded-xl transition-all ${
      isActive(path)
        ? "text-zinc-950 bg-zinc-100 dark:text-white dark:bg-zinc-900"
        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
    }`;

  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-300">
      
      {/* Floating Island Outer Container */}
      <div
        className={`relative flex items-center justify-between px-3.5 sm:px-5 py-2.5 rounded-2xl sm:rounded-full border border-zinc-200/80 bg-white/75 backdrop-blur-xl shadow-xl shadow-black/5 dark:border-white/15 dark:bg-black/75 dark:shadow-black/60 transition-all duration-300 ${
          scrolled ? "border-zinc-300 dark:border-white/25 shadow-2xl" : ""
        }`}
      >
        {/* Brand Logo & Emblem */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-md group-hover:rotate-6 transition-transform duration-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-wider leading-none text-zinc-950 dark:text-white uppercase">
              SKYDGETS
            </span>
            <span className="text-[9px] font-mono tracking-widest text-zinc-400 dark:text-zinc-500 uppercase leading-none mt-0.5">
              Verified Tech
            </span>
          </div>
        </Link>

        {/* Desktop Main Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100/60 dark:bg-zinc-900/60 p-1 rounded-full border border-zinc-200/50 dark:border-zinc-800/80">
          <Link href="/" className={navLinkClass("/")}>
            Home
          </Link>
          <Link href="/products" className={navLinkClass("/products")}>
            Catalog
          </Link>
          <Link href="/about" className={navLinkClass("/about")}>
            About
          </Link>
          <Link href="/contact" className={navLinkClass("/contact")}>
            Contact
          </Link>
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
        </nav>

        {/* Desktop Controls (Admin + Profile / Auth) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Admin Badges */}
          {isAdmin && (
            <div className="flex items-center gap-2 border-r border-zinc-200 dark:border-zinc-800 pr-3">
              <Link
                href="/admin/products"
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-all border border-zinc-200/80 dark:border-zinc-800"
              >
                <Shield className="w-3 h-3" /> Items
              </Link>
              <Link
                href="/admin/ai-drafts"
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 transition-all shadow-sm"
              >
                <Sparkles className="w-3 h-3" /> AI Drafts
              </Link>
            </div>
          )}

          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/60">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-950/10 dark:ring-white/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex w-6 h-6 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[10px] font-bold">
                    {userInitial}
                  </div>
                )}
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[90px] truncate">
                  {session.user.name.split(" ")[0]}
                </span>
              </div>

              <button
                onClick={handleSignOut}
                className="p-1.5 text-zinc-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 transition-colors cursor-pointer rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 px-4.5 py-1.5 text-xs font-bold text-white dark:text-zinc-950 transition-all border border-transparent dark:border-white shadow-md active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Controls & Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {session && (
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Glassmorphism Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mt-2 md:hidden rounded-2xl border border-zinc-200/80 bg-white/90 dark:border-white/15 dark:bg-black/90 backdrop-blur-2xl p-4 space-y-1 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/")}>
            <span>Home</span>
          </Link>
          <Link href="/products" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/products")}>
            <span>Explore Catalog</span>
          </Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/about")}>
            <span>About SKYDGETS</span>
          </Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/contact")}>
            <span>Contact Support</span>
          </Link>

          {session && (
            <>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
              <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/cart")}>
                <span>Shopping Cart</span>
              </Link>
              <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/orders")}>
                <span>My Orders</span>
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
              <p className="px-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">
                Admin Controls
              </p>
              <Link href="/admin/products" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/admin/products")}>
                <span>Manage Products</span>
              </Link>
              <Link href="/admin/ai-drafts" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass("/admin/ai-drafts")}>
                <span>AI Listing Drafts</span>
              </Link>
            </>
          )}

          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-3" />

          {session ? (
            <div className="px-4 py-2.5 flex items-center justify-between gap-4 bg-zinc-100/80 dark:bg-zinc-900/80 rounded-xl">
              <div className="flex items-center gap-2.5">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-7 h-7 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex w-7 h-7 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold">
                    {userInitial}
                  </div>
                )}
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {session.user.name}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold py-3 rounded-xl text-sm transition-all shadow-md"
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