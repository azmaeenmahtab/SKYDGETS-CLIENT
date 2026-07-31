"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingCart, 
  ArrowRight, 
  AlertTriangle, 
  Minus, 
  Plus, 
  Trash2, 
  PackageOpen, 
  ShieldCheck, 
  Truck, 
  Lock,
  Sparkles
} from "lucide-react";
import { fetchCart } from "@/lib/api/cart";
import { useCartMutations } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import type { CartItemPopulated } from "@/types/cart";

function CartItemRow({ item }: { item: CartItemPopulated }) {
  const { updateQuantity, removeItem, isLoading } = useCartMutations();
  const priceChanged = item.currentPrice !== item.priceAtAdd;

  return (
    <div className="group flex flex-col sm:flex-row gap-4 p-5 bg-white border border-zinc-200/80 rounded-3xl hover:border-zinc-300 transition-all duration-200 shadow-sm">
      {/* Product Image Canvas */}
      <div className="relative w-full sm:w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-zinc-100">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="112px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-zinc-400" />
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-extrabold text-zinc-950 text-base leading-snug line-clamp-2">
              {item.title}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-zinc-100 text-zinc-700 flex-shrink-0">
              {item.condition.replace(/_/g, " ")}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-black text-zinc-950">
              {formatPrice(item.priceAtAdd)}
            </span>
            {priceChanged && (
              <span className="text-xs text-zinc-400 line-through">
                {formatPrice(item.currentPrice)}
              </span>
            )}
          </div>

          {/* Price changed warning */}
          {priceChanged && (
            <div className="flex items-center gap-1.5 mt-2 text-amber-700 text-xs bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                Price changed to {formatPrice(item.currentPrice)} — cart reflects price when added
              </span>
            </div>
          )}

          {/* Low stock warning */}
          {item.stock <= 3 && item.stock > 0 && (
            <p className="text-xs font-semibold text-orange-600 mt-1.5">
              Only {item.stock} left in stock
            </p>
          )}
        </div>

        {/* Action Row: Stepper & Delete */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
          <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
            <button
              id={`decrease-qty-${item.productId}`}
              aria-label="Decrease quantity"
              onClick={() =>
                updateQuantity(item.productId, Math.max(0, item.quantity - 1))
              }
              disabled={isLoading}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white text-zinc-600 hover:text-zinc-950 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-extrabold text-zinc-950">
              {item.quantity}
            </span>
            <button
              id={`increase-qty-${item.productId}`}
              aria-label="Increase quantity"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              disabled={isLoading || item.quantity >= item.stock}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white text-zinc-600 hover:text-zinc-950 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            id={`remove-item-${item.productId}`}
            onClick={() => removeItem(item.productId)}
            disabled={isLoading}
            className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 cursor-pointer"
            title="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
  });

  const { clearCart, isLoading: isMutating } = useCartMutations();

  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + item.priceAtAdd * item.quantity,
    0
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-zinc-900">
      {/* Background Radial Grid Spotlight */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-28 sm:pt-32 pb-16 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20 mb-3">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>YOUR SHOPPING CART</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 flex items-center gap-3">
            Review Your Items
            {items.length > 0 && (
              <span className="text-base font-normal text-zinc-500">
                ({items.length} item{items.length !== 1 ? "s" : ""})
              </span>
            )}
          </h1>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-3xl bg-zinc-100 animate-pulse border border-zinc-200/50"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-zinc-200/80 rounded-3xl shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center mb-6">
              <PackageOpen className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-950 mb-2">
              Your cart is empty
            </h2>
            <p className="text-zinc-500 mb-8 max-w-sm text-sm leading-relaxed">
              Looks like you haven't added any verified gadgets to your cart yet. Explore our live catalog.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold rounded-full transition-all shadow-lg active:scale-95 text-sm uppercase tracking-wider"
            >
              Browse Catalog
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Cart with items */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items list */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}

              <div className="flex justify-end pt-2">
                <button
                  id="clear-cart"
                  onClick={clearCart}
                  disabled={isMutating}
                  className="text-xs font-semibold text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear entire cart
                </button>
              </div>
            </div>

            {/* Order summary sidebar */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-28 bg-white border border-zinc-200/80 rounded-3xl p-6 space-y-5 shadow-xl shadow-black/5">
                <h2 className="font-extrabold text-xl text-zinc-950 tracking-tight">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm border-b border-zinc-100 pb-4">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between items-center text-zinc-600 text-xs"
                    >
                      <span className="truncate max-w-[180px] font-medium text-zinc-900">
                        {item.title} × {item.quantity}
                      </span>
                      <span className="font-bold text-zinc-950 ml-2">
                        {formatPrice(item.priceAtAdd * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-500 text-xs">
                    <span>Shipping Fee</span>
                    <span className="text-emerald-600 font-bold uppercase tracking-wider">
                      Free Shipping
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-zinc-100">
                    <span className="font-bold text-zinc-950 text-base">Subtotal</span>
                    <span className="text-2xl font-black text-zinc-950">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>

                <Link
                  id="proceed-to-checkout"
                  href="/checkout"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold rounded-full transition-all shadow-xl active:scale-95 text-sm uppercase tracking-wider"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="pt-2 border-t border-zinc-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>7-Day Hardware Money-Back Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Truck className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span>Insured Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
