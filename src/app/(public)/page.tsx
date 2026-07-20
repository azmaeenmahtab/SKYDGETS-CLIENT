import Link from "next/link";
import { serverFetch } from "@/lib/api/server-fetch";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import { 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  Layers, 
  ShoppingBag, 
  CheckCircle2 
} from "lucide-react";

interface StatsSummary {
  totalProducts: number;
  totalCategories: number;
  totalOrdersFulfilled: number;
}

interface GetProductsResponse {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// Fallback images for categories if no real product image exists
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  "phones-tablets": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600",
  "pc-components": "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=600",
  "small-electronics": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"
};

export default async function HomePage() {
  // Fetch stats, featured products, and categories in parallel server-side
  let stats: StatsSummary = { totalProducts: 0, totalCategories: 0, totalOrdersFulfilled: 0 };
  let featuredProducts: Product[] = [];
  let categories: Category[] = [];

  try {
    const statsRes = await serverFetch<StatsSummary>("/stats/summary");
    if (statsRes) stats = statsRes;
  } catch (err) {
    console.error("Failed to fetch stats for homepage:", err);
  }

  try {
    const productsRes = await serverFetch<GetProductsResponse>("/products?limit=8&status=published");
    if (productsRes && productsRes.items) {
      featuredProducts = productsRes.items;
    }
  } catch (err) {
    console.error("Failed to fetch featured products for homepage:", err);
  }

  try {
    const categoriesRes = await serverFetch<Category[]>("/categories");
    if (categoriesRes) {
      categories = categoriesRes.filter(cat => cat.parentId === null);
    }
  } catch (err) {
    console.error("Failed to fetch categories for homepage:", err);
  }

  // Get background images for top-level categories based on their products
  const categoryImages: Record<string, string> = {};
  for (const cat of categories) {
    const matchedProduct = featuredProducts.find(p => p.categoryPath.startsWith(cat.slug));
    const primaryImg = matchedProduct?.images.find(img => img.isPrimary) || matchedProduct?.images[0];
    categoryImages[cat.slug] = primaryImg?.url || CATEGORY_FALLBACK_IMAGES[cat.slug] || "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&q=80&w=600";
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[65vh] flex items-center justify-center overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=1200')` }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/60 to-transparent"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Reimagining Secondhand Electronics
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
            Verified Gadgets. <span className="text-primary">Certified Grades.</span> Fair Pricing.
          </h1>
          <p className="mt-4 text-lg md:text-xl text-zinc-300 max-w-2xl font-light">
            Every device on SKYDGETS goes through our strict AI-assisted condition grading before going live. Instant local delivery.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/products" className="inline-flex items-center justify-center bg-primary hover:bg-primary/95 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-primary/20 gap-2">
              Browse Catalog <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/about" className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-8 py-3.5 rounded-xl transition-all">
              Learn Our Grading
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SHOWCASE */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center md:text-left mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight">Shop by Category</h2>
          <p className="mt-2 text-zinc-500 max-w-md">Find the exact segment of secondhand electronics you are looking for.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <Link 
                key={cat._id}
                href={`/products?category=${cat.slug}`}
                className="group relative h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex items-end p-6 border border-zinc-200/50 dark:border-zinc-800/50"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${categoryImages[cat.slug]}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-85" />
                <div className="relative z-10 w-full flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{cat.name}</h3>
                    <p className="text-xs text-zinc-300 mt-1">Explore listings</p>
                  </div>
                  <span className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-primary transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))
          ) : (
            // Static grid elements representing the 3 main categories if seed data fails
            [
              { name: "Phones & Tablets", slug: "phones-tablets" },
              { name: "PC & Components", slug: "pc-components" },
              { name: "Small Electronics", slug: "small-electronics" }
            ].map((cat) => (
              <Link 
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex items-end p-6 border border-zinc-200/50 dark:border-zinc-800/50"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${CATEGORY_FALLBACK_IMAGES[cat.slug]}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-85" />
                <div className="relative z-10 w-full flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{cat.name}</h3>
                    <p className="text-xs text-zinc-300 mt-1">Explore listings</p>
                  </div>
                  <span className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-primary transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="py-16 bg-zinc-100/50 dark:bg-zinc-900/50 border-y border-zinc-200/50 dark:border-zinc-850 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Newly Listed Gadgets</h2>
              <p className="mt-2 text-zinc-500 max-w-md">The latest verified products ready for secure delivery.</p>
            </div>
            <Link href="/products" className="inline-flex items-center gap-1.5 text-primary hover:text-primary-semibold font-semibold text-sm transition-colors">
              Explore catalog <ChevronIcon className="w-4 h-4" />
            </Link>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-zinc-905 border border-zinc-250/50 dark:border-zinc-800 rounded-2xl p-6">
              <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold">No Products Live Yet</h3>
              <p className="text-zinc-500 mt-1">We are busy listing awesome gadgets. Check back shortly!</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. WHY SKYDGETS / HOW IT WORKS */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Why Shop at SKYDGETS?</h2>
          <p className="mt-2 text-zinc-500 max-w-md mx-auto">We eliminate the risk of purchasing secondhand electronics.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl shadow-sm">
            <span className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h3 className="text-xl font-bold">Certified Condition Grading</h3>
            <p className="text-zinc-500 mt-2 text-sm leading-relaxed">
              Every single listing is inspected and grade-certified before going live. No surprises, no hidden defect cover-ups.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl shadow-sm">
            <span className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4">
              <Truck className="w-6 h-6" />
            </span>
            <h3 className="text-xl font-bold">Secure Local Delivery</h3>
            <p className="text-zinc-500 mt-2 text-sm leading-relaxed">
              Enjoy cash on delivery across cities, plus fast payments via bKash & Nagad. Secure dispute-resolution window.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl shadow-sm">
            <span className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </span>
            <h3 className="text-xl font-bold">AI-Assisted Listing Accuracy</h3>
            <p className="text-zinc-500 mt-2 text-sm leading-relaxed">
              Our AI scan identifies exact gadget specs directly from diagnostics. Accurate specifications, zero guesswork.
            </p>
          </div>
        </div>
      </section>

      {/* 5. STATS SECTION */}
      <section className="py-12 bg-primary text-white w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col justify-center items-center">
              <span className="text-4xl md:text-5xl font-extrabold tracking-tight">{stats.totalProducts}</span>
              <span className="text-primary-foreground/80 mt-2 text-sm uppercase tracking-wider font-semibold">Active Products Listed</span>
            </div>
            <div className="flex flex-col justify-center items-center">
              <span className="text-4xl md:text-5xl font-extrabold tracking-tight">{stats.totalCategories}</span>
              <span className="text-primary-foreground/80 mt-2 text-sm uppercase tracking-wider font-semibold">Supported Categories</span>
            </div>
            <div className="flex flex-col justify-center items-center">
              <span className="text-4xl md:text-5xl font-extrabold tracking-tight">{stats.totalOrdersFulfilled}</span>
              <span className="text-primary-foreground/80 mt-2 text-sm uppercase tracking-wider font-semibold">Delivered Orders</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-16 mx-auto max-w-3xl px-4 sm:px-6 w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2">
            <HelpCircle className="w-7 h-7 text-primary" /> FAQ
          </h2>
          <p className="mt-2 text-zinc-500">Frequently asked questions about the marketplace.</p>
        </div>
        <div className="space-y-4">
          <details className="group border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-zinc-900 dark:text-white">
              <h3 className="font-semibold text-base">What do condition grades mean?</h3>
              <span className="shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 p-1.5 text-zinc-900 dark:text-white group-open:-rotate-185 transition-transform duration-200">
                <ChevronIcon className="w-4 h-4" />
              </span>
            </summary>
            <p className="mt-4 text-sm text-zinc-500 leading-relaxed">
              We certify products across five classes: 
              <strong className="text-zinc-700 dark:text-zinc-300 block mt-2">New:</strong> Brand new, unused items in sealed original box.
              <strong className="text-zinc-700 dark:text-zinc-300 block mt-1">Like New:</strong> Minimal to no signs of wear, flawless screen.
              <strong className="text-zinc-700 dark:text-zinc-300 block mt-1">Good:</strong> Fully functional, light signs of daily usage (minor surface micro-scratches).
              <strong className="text-zinc-700 dark:text-zinc-300 block mt-1">Fair:</strong> Scratches or scuffs present on casing, 100% operational hardware.
              <strong className="text-zinc-700 dark:text-zinc-300 block mt-1">For Parts:</strong> Hardware faults present, ideal for salvage/spare repair.
            </p>
          </details>

          <details className="group border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-zinc-900 dark:text-white">
              <h3 className="font-semibold text-base">What is the return/dispute policy?</h3>
              <span className="shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 p-1.5 text-zinc-900 dark:text-white group-open:-rotate-185 transition-transform duration-200">
                <ChevronIcon className="w-4 h-4" />
              </span>
            </summary>
            <p className="mt-4 text-sm text-zinc-500 leading-relaxed">
              If the device details differ from the AI listing report or the certified condition grade, you can file a return request within 3 days of delivery. Once verified, we refund your amount immediately.
            </p>
          </details>

          <details className="group border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-zinc-900 dark:text-white">
              <h3 className="font-semibold text-base">What payment methods are supported?</h3>
              <span className="shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 p-1.5 text-zinc-900 dark:text-white group-open:-rotate-185 transition-transform duration-200">
                <ChevronIcon className="w-4 h-4" />
              </span>
            </summary>
            <p className="mt-4 text-sm text-zinc-500 leading-relaxed">
              We offer Cash on Delivery (COD) for ultimate safety. We also support online mobile payments via bKash, Nagad, and local card integrations upon checkout.
            </p>
          </details>

          <details className="group border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-zinc-900 dark:text-white">
              <h3 className="font-semibold text-base">How long does delivery take?</h3>
              <span className="shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 p-1.5 text-zinc-900 dark:text-white group-open:-rotate-185 transition-transform duration-200">
                <ChevronIcon className="w-4 h-4" />
              </span>
            </summary>
            <p className="mt-4 text-sm text-zinc-500 leading-relaxed">
              Delivery within Dhaka occurs in 24-48 hours. Nationwide delivery through certified couriers takes between 3 to 5 business days.
            </p>
          </details>
        </div>
      </section>

      {/* 7. CTA / NEWSLETTER BANNER */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full mb-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-indigo-900 to-zinc-950 py-12 px-6 sm:px-12 md:py-20 md:px-22 shadow-xl border border-white/10 text-center flex flex-col items-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
          <h2 className="relative z-10 text-3xl font-extrabold text-white sm:text-4xl max-w-xl leading-tight">
            Ready to find your next gadget at half the price?
          </h2>
          <p className="relative z-10 mt-4 text-lg text-zinc-300 max-w-md">
            Explore our condition-certified catalog and make a smart purchase today.
          </p>
          <div className="relative z-10 mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/products" className="inline-flex items-center justify-center bg-white hover:bg-zinc-100 text-zinc-900 font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-white/5">
              Explore Products
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center bg-zinc-900/50 hover:bg-zinc-900/80 text-white border border-zinc-700/50 font-semibold px-8 py-3.5 rounded-xl transition-all">
              Contact Support
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}

// Small helper UI components to keep file independent and fast compiling
function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
