import Link from "next/link";
import { 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  Zap, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  ShoppingBag,
  Clock,
  Lock
} from "lucide-react";

export const metadata = {
  title: "About Us — SKYDGETS",
  description: "Learn how SKYDGETS sources genuine gadgets directly from abroad, quality-checks every unit, and delivers them to Bangladesh at fair, transparent prices.",
};

const STATS = [
  { label: "Listings Accuracy", value: "99.4%", description: "AI-assisted specs & description accuracy" },
  { label: "Gadgets Delivered", value: "12,500+", description: "Smartphones, laptops, monitors, and peripherals" },
  { label: "Average Delivery Time", value: "24 Hours", description: "Express local fulfillment & reliable shipping" },
  { label: "Quality Verified", value: "100%", description: "Every unit pre-shipment checked before dispatch" },
];

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Directly Sourced from Abroad",
    description: "We source gadgets directly from manufacturers and trusted global channels — eliminating middlemen so you get genuine products without unnecessary price markups.",
    badge: "Direct Import",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    icon: Cpu,
    title: "Pre-Shipment Quality Inspection",
    description: "Every unit undergoes a quality check before it ships — verifying that hardware functions correctly, packaging is intact, and specs match what's listed.",
    badge: "QC Verified",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    icon: TrendingUp,
    title: "AI-Accurate Listings & Fair Pricing",
    description: "Our Gemini AI pipeline reads product photos to auto-fill accurate specs and generate honest descriptions, so listings reflect what you actually receive.",
    badge: "Gemini AI Powered",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    icon: Zap,
    title: "Fast, Transparent Delivery",
    description: "Orders are processed same-day and dispatched with express local shipping. No surprise fees, no opaque handling charges — just fast delivery to your doorstep.",
    badge: "Express Shipping",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Curated Global Sourcing",
    description: "We identify and import genuine gadgets from trusted manufacturers and suppliers abroad, selecting products based on quality, authenticity, and real market demand.",
  },
  {
    step: "02",
    title: "Pre-Shipment Quality Check",
    description: "Every unit is checked before it leaves — confirming hardware functionality, intact packaging, and spec accuracy, assisted by AI-powered listing review for honest descriptions.",
  },
  {
    step: "03",
    title: "Doorstep Delivery, Honest Pricing",
    description: "Orders ship fast with express local delivery. Pricing is set transparently based on direct import cost, with no hidden middleman layers.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-zinc-900">
      
      {/* HERO SECTION */}
      <section className="relative w-full pt-28 sm:pt-36 pb-16 md:pb-24 overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-zinc-50/80 via-white to-white">
        {/* Background Grid Spotlight */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.08),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Tag Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20 shadow-sm mb-6">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>GENUINE IMPORTED GADGETS</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-950 leading-[1.08] max-w-4xl">
            Authentic Tech. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-500">
              Honest Prices.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-600 max-w-2xl font-normal leading-relaxed">
            SKYDGETS sources genuine gadgets directly from abroad, quality-checks every unit before it ships, and delivers them to Bangladesh at transparent, fair prices — no middlemen, no grey-market risk.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold px-8 py-3.5 rounded-full transition-all duration-300 shadow-xl shadow-black/10 gap-2 text-sm uppercase tracking-wider active:scale-95"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold px-8 py-3.5 rounded-full border border-zinc-200 transition-all text-sm active:scale-95"
            >
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS TICKER */}
      <section className="relative z-20 -mt-8 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-6 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-black/5">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col p-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/60 text-center"
            >
              <span className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1 uppercase tracking-wider">
                {stat.label}
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                {stat.description}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CORE PILLARS SECTION */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-2">
            Built for Buyers Who Care
          </h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Why SKYDGETS Exists
          </h3>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-base sm:text-lg">
            Importing gadgets from abroad means navigating grey markets, counterfeit risks, and opaque pricing. We built SKYDGETS to do that work for you — sourcing genuine products directly and passing the savings on.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-purple-500/40 dark:hover:border-purple-500/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${pillar.badgeColor}`}>
                    {pillar.badge}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-zinc-950 dark:text-white mb-3">
                  {pillar.title}
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS / TIMELINE */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200/80 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
              How It Works
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white">
              From Sourcing to Doorstep
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {STEPS.map((step, idx) => (
              <div
                key={idx}
                className="relative flex flex-col p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm"
              >
                <span className="text-4xl font-black font-mono text-purple-600 dark:text-purple-400/80 mb-4">
                  {step.step}
                </span>
                <h4 className="text-lg font-bold text-zinc-950 dark:text-white mb-2">
                  {step.title}
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA CALLOUT BANNER */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white p-8 sm:p-14 shadow-2xl">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.25),transparent_60%)]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="max-w-xl">
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Ready to get your next genuine import?
              </h3>
              <p className="mt-3 text-zinc-400 text-sm sm:text-base">
                Browse our catalog of authentic smartphones, tablets, monitors, and peripherals — quality-checked and ready to ship.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-white hover:bg-zinc-200 text-zinc-950 font-extrabold px-8 py-4 rounded-full transition-all text-sm uppercase tracking-wider gap-2 flex-shrink-0 active:scale-95 shadow-xl"
            >
              <span>Shop Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
