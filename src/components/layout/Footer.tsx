import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { Mail, Phone, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-zinc-850 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white text-zinc-950 font-black text-xs shadow-md">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-lg font-black tracking-wider text-white uppercase">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-sm text-zinc-500 max-w-sm leading-relaxed font-light mt-1">
              {siteConfig.tagline} Authentic gadgets imported directly from abroad, quality-checked before dispatch, and delivered fast.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-white text-xs tracking-widest uppercase font-mono">Marketplace</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Explore Catalog
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-white text-xs tracking-widest uppercase font-mono">Contact Support</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a 
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="inline-flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-zinc-400" />
                  <span className="truncate max-w-[180px]">{siteConfig.contactEmail}</span>
                </a>
              </li>
              <li>
                <a 
                  href={`tel:${siteConfig.contactPhone}`}
                  className="inline-flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-zinc-400" />
                  <span>{siteConfig.contactPhone}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-zinc-850 my-8" />

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 font-mono">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>AI-Verified Specs &amp; Quality Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
