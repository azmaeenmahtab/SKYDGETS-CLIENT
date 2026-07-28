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
  description: "Learn how SKYDGETS uses AI visual evaluation and automated multi-point hardware diagnostics to redefine secondhand gadget resale.",
};

const STATS = [
  { label: "AI Inspection Accuracy", value: "99.4%", description: "Automated multi-point hardware & visual grading" },
  { label: "Verified Gadgets Sold", value: "12,500+", description: "Smartphones, laptops, monitors, and peripherals" },
  { label: "Average Delivery Time", value: "24 Hours", description: "Express local fulfillment & insured shipping" },
  { label: "Buyer Protection", value: "100%", description: "Risk-free hardware guarantee & verified sellers" },
];

const PILLARS = [
  {
    icon: Cpu,
    title: "AI Visual & Hardware Diagnostics",
    description: "Every device submitted to SKYDGETS undergoes automated vision model analysis to detect cosmetic scuffs, screen micro-scratches, and battery wear metrics before listing.",
    badge: "Gemini Vision Inside",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    icon: TrendingUp,
    title: "Dynamic Fair Price Engine",
    description: "Our machine-learning pricing pipeline analyzes real-time market values, historical sales, and physical hardware grades to ensure fair deals for both buyers and sellers.",
    badge: "Market Balanced",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Uncompromising Authenticity",
    description: "No counterfeit parts, no hidden defects. We verify serial numbers, IMEI status, and component integrity so you get exactly what is advertised.",
    badge: "100% Certified",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    icon: RefreshCw,
    title: "Sustainable Tech Ecosystem",
    description: "By extending the lifecycle of high-tier electronics, we reduce e-waste and make premium smartphones, tablets, and PC hardware accessible to everyone.",
    badge: "Eco-Conscious",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Multi-Point AI Scan",
    description: "Sellers upload full-resolution photos. Our Gemini Vision pipeline analyzes cosmetic grade, detects scuffs, and auto-fills technical specifications.",
  },
  {
    step: "02",
    title: "Automated Price Evaluation",
    description: "The pricing engine calculates optimal market price ranges based on condition grade, brand demand, and live component pricing.",
  },
  {
    step: "03",
    title: "Verified Delivery to Doorstep",
    description: "Buyers order with full hardware protection. Items are verified, securely packed, and delivered with express shipping.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      
      {/* HERO SECTION */}
      <section className="relative w-full pt-28 sm:pt-36 pb-16 md:pb-24 overflow-hidden border-b border-zinc-200/80 dark:border-zinc-800 bg-gradient-to-b from-zinc-50/80 via-white to-white dark:from-zinc-900/60 dark:via-zinc-950 dark:to-zinc-950">
        {/* Background Grid Spotlight */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.08),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Tag Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-sm mb-6">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>REDEFINING SECONDHAND TECH</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-950 dark:text-white leading-[1.08] max-w-4xl">
            Verified Hardware. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-500">
              Zero Guesswork.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl font-normal leading-relaxed">
            SKYDGETS is the premier resale marketplace engineered with automated AI visual grading and multi-point hardware evaluation to make buying and selling pre-owned gadgets effortless and transparent.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-extrabold px-8 py-3.5 rounded-full transition-all duration-300 shadow-xl shadow-black/10 gap-2 text-sm uppercase tracking-wider active:scale-95"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold px-8 py-3.5 rounded-full border border-zinc-200 dark:border-zinc-800 transition-all text-sm active:scale-95"
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
            Engineered for Integrity
          </h2>
          <h3 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Why Gadget Resale Needs SKYDGETS
          </h3>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-base sm:text-lg">
            Traditional secondhand markets are fraught with hidden flaws and arbitrary prices. We built a data-backed pipeline to solve it.
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
              Automated Process
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white">
              From Inspection to Delivery
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
                Ready to find your next verified gadget?
              </h3>
              <p className="mt-3 text-zinc-400 text-sm sm:text-base">
                Browse our live catalog of certified smartphones, tablets, monitors, and peripherals with instant shipping.
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
