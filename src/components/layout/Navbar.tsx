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
        ? "bg-zinc-950 text-white shadow-md"
        : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80"
    }`;

  const mobileNavLinkClass = (path: string) =>
    `flex items-center justify-between text-sm font-semibold px-4 py-3 rounded-xl transition-all ${
      isActive(path)
        ? "text-zinc-950 bg-zinc-100"
        : "text-zinc-600 hover:bg-zinc-50"
    }`;

  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-300">
      
      {/* Floating Island Glassmorphism Container */}
      <div
        className={`relative flex items-center justify-between px-3.5 sm:px-5 py-2.5 rounded-2xl sm:rounded-full border transition-all duration-300 ${
          scrolled
            ? "bg-white/75 backdrop-blur-2xl backdrop-saturate-150 border-white/80 shadow-xl shadow-purple-950/10"
            : "bg-white/60 backdrop-blur-xl backdrop-saturate-150 border-white/70 shadow-lg shadow-purple-950/5"
        }`}
      >
        {/* Brand Logo & Emblem */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-950 text-white shadow-md group-hover:rotate-6 transition-transform duration-300">
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
            <span className="text-base font-black tracking-wider leading-none text-zinc-950 uppercase">
              SKYDGETS
            </span>
            <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase leading-none mt-0.5 font-bold">
              Verified Tech
            </span>
          </div>
        </Link>

        {/* Desktop Main Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100/60 backdrop-blur-md p-1 rounded-full border border-white/50 shadow-inner">
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

        {/* Right Action Icons & Auth User Menu */}
        <div className="hidden md:flex items-center gap-2">
          {session && isAdmin && (
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}

          {session ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200/80">
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full bg-zinc-100/60 hover:bg-zinc-200/80 transition-all border border-white/50 cursor-pointer"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-6 h-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex w-6 h-6 items-center justify-center rounded-full bg-zinc-950 text-white text-[10px] font-bold">
                    {userInitial}
                  </div>
                )}
                <span className="text-xs font-semibold text-zinc-900 line-clamp-1 max-w-[100px]">
                  {session.user.name}
                </span>
              </Link>

              <button
                onClick={handleSignOut}
                className="p-2 rounded-full text-zinc-500 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full text-xs font-bold text-zinc-700 hover:text-zinc-950 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold bg-zinc-950 hover:bg-zinc-800 text-white transition-all shadow-md active:scale-95"
              >
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-zinc-100/60 text-zinc-800 hover:bg-zinc-200/80 transition-colors cursor-pointer border border-white/50"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Glassmorphism Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mt-2 md:hidden rounded-2xl border border-white/80 bg-white/75 backdrop-blur-2xl backdrop-saturate-150 p-4 space-y-1 shadow-2xl shadow-purple-950/10 animate-in fade-in slide-in-from-top-2 duration-200">
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
              <div className="h-px bg-zinc-200/80 my-2" />
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
              <div className="h-px bg-zinc-200/80 my-2" />
              <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
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

          <div className="h-px bg-zinc-200/80 my-3" />

          {session ? (
            <div className="px-4 py-2.5 flex items-center justify-between gap-4 bg-zinc-100/60 backdrop-blur-md rounded-xl border border-white/50">
              <div className="flex items-center gap-2.5">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-7 h-7 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex w-7 h-7 items-center justify-center rounded-full bg-zinc-950 text-white text-xs font-bold">
                    {userInitial}
                  </div>
                )}
                <span className="text-sm font-medium text-zinc-800">
                  {session.user.name}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md"
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