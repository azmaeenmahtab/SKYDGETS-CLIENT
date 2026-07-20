"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, ArrowRight, AlertTriangle, Minus, Plus, Trash2, PackageOpen } from "lucide-react";
import { fetchCart } from "@/lib/api/cart";
import { useCartMutations } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import type { CartItemPopulated } from "@/types/cart";

function CartItemRow({ item }: { item: CartItemPopulated }) {
  const { addItem, updateQuantity, removeItem, isLoading } = useCartMutations();
  const priceChanged = item.currentPrice !== item.priceAtAdd;

  return (
    <div className="group flex gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-200">
      {/* Product Image */}
      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-white/10">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-white/30" />
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-1">
          {item.title}
        </h3>
        <span className="inline-block px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/60 capitalize mb-2">
          {item.condition.replace(/_/g, " ")}
        </span>

        {/* Price */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-white">
            {formatPrice(item.priceAtAdd)}
          </span>
          {priceChanged && (
            <span className="text-xs text-white/50 line-through">
              {formatPrice(item.currentPrice)}
            </span>
          )}
        </div>

        {/* Price changed warning */}
        {priceChanged && (
          <div className="flex items-center gap-1.5 mt-1.5 text-amber-400 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              Price changed to {formatPrice(item.currentPrice)} — your cart reflects the price when added
            </span>
          </div>
        )}

        {/* Low stock warning */}
        {item.stock <= 3 && item.stock > 0 && (
          <p className="text-xs text-orange-400 mt-1">Only {item.stock} left in stock</p>
        )}
      </div>

      {/* Quantity + Remove */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        {/* Quantity Stepper */}
        <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
          <button
            id={`decrease-qty-${item.productId}`}
            aria-label="Decrease quantity"
            onClick={() =>
              updateQuantity(item.productId, Math.max(0, item.quantity - 1))
            }
            disabled={isLoading}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-40"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-white tabular-nums">
            {item.quantity}
          </span>
          <button
            id={`increase-qty-${item.productId}`}
            aria-label="Increase quantity"
            onClick={() =>
              updateQuantity(
                item.productId,
                Math.min(item.stock, item.quantity + 1)
              )
            }
            disabled={isLoading || item.quantity >= item.stock}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Line total */}
        <p className="text-sm font-bold text-white">
          {formatPrice(item.priceAtAdd * item.quantity)}
        </p>

        {/* Remove button */}
        <button
          id={`remove-${item.productId}`}
          aria-label={`Remove ${item.title}`}
          onClick={() => removeItem(item.productId)}
          disabled={isLoading}
          className="text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
    staleTime: 30_000,
  });

  const { clearCart, isLoading: isMutating } = useCartMutations();

  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (sum, item) => sum + item.priceAtAdd * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-violet-400" />
            Your Cart
            {items.length > 0 && (
              <span className="text-lg font-normal text-white/40">
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
                className="h-28 rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-6">
              <PackageOpen className="w-10 h-10 text-violet-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-white/50 mb-8 max-w-xs">
              Looks like you haven't added anything yet. Browse our gadgets to find something you'll love.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Cart with items */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}

              <button
                id="clear-cart"
                onClick={clearCart}
                disabled={isMutating}
                className="text-sm text-white/30 hover:text-red-400 transition-colors mt-2 flex items-center gap-1.5 disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear entire cart
              </button>
            </div>

            {/* Order summary sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-lg text-white">Order Summary</h2>

                <div className="space-y-2 text-sm">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between text-white/60"
                    >
                      <span className="truncate max-w-[160px]">
                        {item.title} × {item.quantity}
                      </span>
                      <span className="font-medium text-white ml-2">
                        {formatPrice(item.priceAtAdd * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-white/60 text-sm mb-1">
                    <span>Shipping</span>
                    <span className="text-emerald-400 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                </div>

                <Link
                  id="proceed-to-checkout"
                  href="/checkout"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/products"
                  className="block text-center text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  ← Continue shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
