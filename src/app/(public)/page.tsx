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
  ShoppingBag, 
  CheckCircle2,
  Cpu,
  Smartphone,
  Headphones,
  Award,
  Zap,
  XCircle,
  TrendingUp,
  Activity,
  BatteryCharging,
  SlidersHorizontal
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
  "phones-tablets": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800",
  "pc-components": "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=800",
  "small-electronics": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"
};

export default async function HomePage() {
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

  const categoryImages: Record<string, string> = {};
  for (const cat of categories) {
    const matchedProduct = featuredProducts.find(p => p.categoryPath.startsWith(cat.slug));
    const primaryImg = matchedProduct?.images.find(img => img.isPrimary) || matchedProduct?.images[0];
    categoryImages[cat.slug] = primaryImg?.url || CATEGORY_FALLBACK_IMAGES[cat.slug] || "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&q=80&w=800";
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-zinc-900 selection:bg-zinc-950 selection:text-white">
      
      {/* 1. HERO SECTION (Primary White Theme + Black Accents) */}
      <section className="relative w-full pt-32 sm:pt-40 pb-20 md:pb-28 flex flex-col items-center justify-center overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-zinc-50/60 via-white to-white">
        
        {/* Subtle Background Grid Spotlight */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(24,24,27,0.06),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          
          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-zinc-100 text-zinc-950 border border-zinc-300 shadow-sm mb-8 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
            <span>AI-POWERED HARDWARE VERIFICATION</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-zinc-950 leading-[1.05] max-w-5xl">
            Verified Tech. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-950 via-zinc-700 to-zinc-500">
              Certified Grade.
            </span>{" "}
            Fair Price.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-600 max-w-2xl font-normal leading-relaxed">
            Every secondhand device on SKYDGETS undergoes automated AI visual evaluation and multi-point hardware diagnostics before going live. Instant local delivery.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold px-9 py-4 rounded-full transition-all duration-300 shadow-xl shadow-black/10 gap-2 text-sm uppercase tracking-wider group active:scale-95"
            >
              Browse Catalog
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center bg-white hover:bg-zinc-100 text-zinc-950 border border-zinc-300 font-extrabold px-9 py-4 rounded-full transition-all duration-300 text-sm uppercase tracking-wider shadow-sm active:scale-95"
            >
              Learn AI Grading
            </Link>
          </div>

          {/* Interactive AI Verification Card Preview (Black Card Accent) */}
          <div className="mt-16 w-full max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-950 text-white p-6 sm:p-8 shadow-2xl text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white text-zinc-950 flex items-center justify-center font-black">
                  SD
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">iPhone 14 Pro Max 256GB</h3>
                  <p className="text-xs text-zinc-400 font-mono">SN: SD-8942-VERIFIED</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> AI GRADE A+ CERTIFIED
              </div>
            </div>

            {/* Diagnostic Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mb-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> Battery Health
                </div>
                <p className="text-lg font-black text-white">96% Original</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mb-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Screen Touch
                </div>
                <p className="text-lg font-black text-white">100% Uniform</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Body Shell
                </div>
                <p className="text-lg font-black text-white">Zero Scratches</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Fair Price Score
                </div>
                <p className="text-lg font-black text-white">Top 5% Value</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CREATIVE INFINITE MARQUEE TICKER (Black Accent Bar) */}
      <section className="bg-zinc-950 text-white py-4 border-y border-zinc-800 overflow-hidden select-none">
        <div className="flex whitespace-nowrap gap-8 animate-marquee text-xs font-mono font-extrabold tracking-widest uppercase">
          <span>✦ VERIFIED SECONDHAND ELECTRONICS</span>
          <span>✦ AI DIAGNOSTIC INSPECTED</span>
          <span>✦ CERTIFIED GRADE A+</span>
          <span>✦ FAIR MARKET PRICING</span>
          <span>✦ 7-DAY RETURN PROTECTION</span>
          <span>✦ FAST LOCAL SHIPPING</span>
          <span>✦ VERIFIED SECONDHAND ELECTRONICS</span>
          <span>✦ AI DIAGNOSTIC INSPECTED</span>
          <span>✦ CERTIFIED GRADE A+</span>
          <span>✦ FAIR MARKET PRICING</span>
        </div>
      </section>

      {/* 3. CURATED CATEGORIES SPOTLIGHT */}
      <section className="py-24 bg-zinc-50/80 border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase">
                Curated Collections
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-950 mt-1">
                Explore Categories
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              View All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <Link
                  key={cat._id || cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="group relative h-84 rounded-3xl overflow-hidden border border-zinc-200 bg-white transition-all duration-500 hover:border-zinc-950 hover:shadow-2xl"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-80"
                    style={{ backgroundImage: `url('${categoryImages[cat.slug]}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                  
                  <div className="relative h-full p-7 flex flex-col justify-between z-10 text-white">
                    <span className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-white w-max shadow-lg">
                      {cat.slug.includes("phone") ? (
                        <Smartphone className="w-5 h-5" />
                      ) : cat.slug.includes("pc") ? (
                        <Cpu className="w-5 h-5" />
                      ) : (
                        <Headphones className="w-5 h-5" />
                      )}
                    </span>

                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:translate-x-1 transition-transform">
                        {cat.name}
                      </h3>
                      {cat.path && (
                        <p className="mt-1 text-xs text-zinc-300 font-mono">
                          /{cat.path}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 mt-4 text-xs font-extrabold text-white uppercase tracking-wider group-hover:text-zinc-200">
                        Explore Category <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              [
                { title: "Phones & Tablets", icon: Smartphone, img: CATEGORY_FALLBACK_IMAGES["phones-tablets"], slug: "phones-tablets" },
                { title: "PC Components", icon: Cpu, img: CATEGORY_FALLBACK_IMAGES["pc-components"], slug: "pc-components" },
                { title: "Small Electronics", icon: Headphones, img: CATEGORY_FALLBACK_IMAGES["small-electronics"], slug: "small-electronics" },
              ].map((c) => (
                <Link
                  key={c.slug}
                  href={`/products?category=${c.slug}`}
                  className="group relative h-84 rounded-3xl overflow-hidden border border-zinc-200 bg-white transition-all duration-500 hover:border-zinc-950 hover:shadow-2xl"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-85"
                    style={{ backgroundImage: `url('${c.img}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                  
                  <div className="relative h-full p-7 flex flex-col justify-between z-10 text-white">
                    <span className="p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-white w-max">
                      <c.icon className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-2xl font-black text-white">{c.title}</h3>
                      <span className="inline-flex items-center gap-1 mt-4 text-xs font-extrabold text-white uppercase tracking-wider">
                        Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

        </div>
      </section>

      {/* 4. FEATURED VERIFIED INVENTORY */}
      <section className="py-24 bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase">
                Verified Inventory
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-950 mt-1">
                Featured Devices
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              Browse All ({stats.totalProducts || featuredProducts.length}) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-12 text-center flex flex-col items-center">
              <ShoppingBag className="w-10 h-10 text-zinc-400 mb-3" />
              <h3 className="text-lg font-extrabold text-zinc-950">No Published Devices Available</h3>
              <p className="text-sm text-zinc-500 mt-1 max-w-md">
                Check back soon or explore our admin drafts section for newly inspected hardware.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* 5. CREATIVE COMPARISON: SKYDGETS vs RANDOM MARKETPLACE */}
      <section className="py-24 bg-zinc-50/80 border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase">
              The SkyDgets Advantage
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-950 mt-2">
              Why Choose Verified Tech?
            </h2>
            <p className="mt-4 text-zinc-600 font-normal text-base sm:text-lg">
              We eliminate secondhand buying risk through algorithmic visual evaluation and standardized hardware benchmarks.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
              
              {/* SKYDGETS Column (Black Accent Header) */}
              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white font-black text-xs flex items-center justify-center">
                    SD
                  </div>
                  <h3 className="text-xl font-black text-zinc-950 uppercase tracking-wide">
                    SKYDGETS Certified
                  </h3>
                </div>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-zinc-950">AI Condition Grading</p>
                      <p className="text-xs text-zinc-500">Scanned for micro-scratches & body wear</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-zinc-950">Multi-Point Hardware Audit</p>
                      <p className="text-xs text-zinc-500">Battery health & screen touch uniformity certified</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-zinc-950">Algorithmic Fair Valuation</p>
                      <p className="text-xs text-zinc-500">No inflated prices or random seller markups</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-zinc-950">7-Day Guarantee Protection</p>
                      <p className="text-xs text-zinc-500">Return protection if device specs differ</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Random Sellers Column */}
              <div className="p-8 sm:p-10 bg-zinc-50/60">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-zinc-200 text-zinc-600 font-bold text-xs flex items-center justify-center">
                    VS
                  </div>
                  <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-wide">
                    Random Marketplaces
                  </h3>
                </div>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3 opacity-70">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-zinc-700">Unverified Photos</p>
                      <p className="text-xs text-zinc-400">Stock images hiding physical scratches</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 opacity-70">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-zinc-700">Hidden Battery Degradation</p>
                      <p className="text-xs text-zinc-400">No hardware diagnostics or battery health checks</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 opacity-70">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-zinc-700">Overpriced / Endless Haggling</p>
                      <p className="text-xs text-zinc-400">Arbitrary seller pricing without benchmarks</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 opacity-70">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-zinc-700">Zero Returns & High Risk</p>
                      <p className="text-xs text-zinc-400">Once paid, seller disappears</p>
                    </div>
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 6. AI INSPECTION WORKFLOW (Black Cards Accent) */}
      <section className="py-24 bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase">
              3-Step Diagnostic
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-950 mt-2">
              How AI Inspection Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 text-white p-8 sm:p-10 flex flex-col justify-between shadow-2xl hover:scale-[1.02] transition-transform">
              <div>
                <span className="w-11 h-11 rounded-2xl bg-white text-zinc-950 font-black text-sm flex items-center justify-center mb-8 shadow-md">
                  01
                </span>
                <h3 className="text-xl font-black text-white mb-2">
                  Visual Damage Scan
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-light">
                  High-resolution photo evaluation checks body panels, glass, and bezel wear to classify cosmetic condition.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-white" /> Visual AI Inspection
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 text-white p-8 sm:p-10 flex flex-col justify-between shadow-2xl hover:scale-[1.02] transition-transform">
              <div>
                <span className="w-11 h-11 rounded-2xl bg-white text-zinc-950 font-black text-sm flex items-center justify-center mb-8 shadow-md">
                  02
                </span>
                <h3 className="text-xl font-black text-white mb-2">
                  Hardware Diagnostic
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-light">
                  Deep verification of battery health cycles, display touch uniformity, camera sensors, and wireless connectivity.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-400">
                <Zap className="w-3.5 h-3.5 text-white" /> Multi-Point Test
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 text-white p-8 sm:p-10 flex flex-col justify-between shadow-2xl hover:scale-[1.02] transition-transform">
              <div>
                <span className="w-11 h-11 rounded-2xl bg-white text-zinc-950 font-black text-sm flex items-center justify-center mb-8 shadow-md">
                  03
                </span>
                <h3 className="text-xl font-black text-white mb-2">
                  Fair Price Benchmark
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-light">
                  Instant price matching based on certified grade (Grade A+, A, B) ensuring buyers pay true market value.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Certified Guarantee
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. PLATFORM STATS */}
      <section className="py-20 bg-zinc-50/80 border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl sm:text-6xl font-black text-zinc-950">{stats.totalProducts || "50+"}</p>
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mt-2">Verified Items</p>
            </div>
            <div>
              <p className="text-4xl sm:text-6xl font-black text-zinc-950">{stats.totalCategories || "8+"}</p>
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mt-2">Categories</p>
            </div>
            <div>
              <p className="text-4xl sm:text-6xl font-black text-zinc-950">{stats.totalOrdersFulfilled || "120+"}</p>
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mt-2">Orders Fulfilled</p>
            </div>
            <div>
              <p className="text-4xl sm:text-6xl font-black text-zinc-950">99.4%</p>
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mt-2">Accuracy Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION BANNER (Black Accent Card) */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-zinc-800 bg-zinc-950 text-white p-10 sm:p-16 text-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.1),rgba(0,0,0,0))]" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Ready to Upgrade Your Tech?
              </h2>
              <p className="mt-4 text-zinc-400 font-light text-base sm:text-lg">
                Discover verified smartphones, graphics cards, components, and audio gear backed by automated grading assurance.
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center bg-white hover:bg-zinc-200 text-zinc-950 font-extrabold px-9 py-4 rounded-full transition-all duration-300 shadow-xl gap-2 text-sm uppercase tracking-wider active:scale-95"
                >
                  Explore All Tech <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
