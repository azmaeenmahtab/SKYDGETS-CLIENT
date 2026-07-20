import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { Mail, Phone, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <Link href="/" className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2">
              <span className="bg-primary text-white p-1 rounded text-[10px] font-black tracking-widest leading-none">
                SD
              </span>
              {siteConfig.name}
            </Link>
            <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
              {siteConfig.tagline} Buy & sell second-hand gadgets with full confidence, verified specs, and certified condition grading.
            </p>
          </div>

          {/* Site Navigation links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-zinc-950 dark:text-white text-sm tracking-wider uppercase">Marketplace</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary transition-colors">
                  Explore Catalog
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Site Configuration Contact Info */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-zinc-950 dark:text-white text-sm tracking-wider uppercase">Get in Touch</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a 
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="inline-flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="truncate max-w-[180px]">{siteConfig.contactEmail}</span>
                </a>
              </li>
              <li>
                <a 
                  href={`tel:${siteConfig.contactPhone}`}
                  className="inline-flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{siteConfig.contactPhone}</span>
                </a>
              </li>
              <li>
                <a 
                  href={`https://instagram.com/${siteConfig.socials.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  <span>@{siteConfig.socials.instagram}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-zinc-200 dark:bg-zinc-850 my-8" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Powered by</span>
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>AI Diagnostics</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
