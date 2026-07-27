"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { Heart, Sparkles } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600",
            alt: product.title,
            isPrimary: true,
            order: 0,
          },
        ];

  const currentImage = images[activeImageIndex] || images[0];

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case "new":
        return "Grade A+ Brand New";
      case "like_new":
        return "Grade A+ Mint";
      case "good":
        return "Grade A Verified";
      case "fair":
        return "Grade B Inspected";
      default:
        return "AI Verified";
    }
  };

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-zinc-200/80 bg-white p-4 transition-all duration-500 hover:border-zinc-400 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1">
      <div>
        {/* Soft Off-White Inner Canvas Frame (Matching Reference Design) */}
        <div className="relative aspect-[4/3.2] w-full overflow-hidden rounded-[24px] bg-[#f0f0f2] p-3 flex flex-col justify-between transition-colors duration-300 group-hover:bg-[#e8e8eb]">
          
          {/* Background Product Image - Fills Inner Canvas Seamlessly */}
          <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[24px]">
            <img
              src={currentImage.url}
              alt={currentImage.alt || product.title}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          </div>

          {/* Top Row: Favorite Heart Button (Top Right Only) */}
          <div className="flex items-center justify-end z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                setLiked(!liked);
              }}
              className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center text-zinc-700 shadow-sm border border-zinc-200/60 hover:scale-110 active:scale-90 transition-all cursor-pointer ml-auto"
              title="Save to Wishlist"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  liked ? "fill-red-500 text-red-500" : "text-zinc-600 hover:text-red-500"
                }`}
              />
            </button>
          </div>

          {/* Bottom Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 z-10 pt-1 pb-0.5">
            {images.slice(0, 3).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveImageIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeImageIndex === idx
                    ? "w-2.5 h-2.5 bg-white shadow-md"
                    : "w-2 h-2 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Below Canvas */}
        <div className="flex flex-col gap-1 mt-4 px-1">
          {/* Brand/Category Tag */}
          <span className="text-xs font-semibold text-emerald-600 font-mono tracking-wide">
            {product.brand || product.categoryPath.split("/")[0] || "SkyDgets"}
          </span>

          {/* Product Title */}
          <h3
            className="text-lg font-extrabold text-zinc-900 line-clamp-1 leading-snug group-hover:text-zinc-700 transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Price formatted in 1000 BDT format */}
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-base font-bold text-zinc-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-zinc-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Full-width Rounded Dark Action Button */}
      <div className="mt-5 px-1">
        <Link href={`/products/${product.slug}`} className="w-full block">
          <button className="w-full rounded-full bg-[#262626] hover:bg-zinc-950 text-white font-bold py-3 px-4 text-sm transition-all duration-300 shadow-md active:scale-98 cursor-pointer flex items-center justify-center">
            <span>Buy Now</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
