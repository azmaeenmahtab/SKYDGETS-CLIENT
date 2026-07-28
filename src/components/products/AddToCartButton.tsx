"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartStateContext";
import { useCartMutations } from "@/hooks/useCart";
import { ShoppingCart, Check, Loader2, AlertCircle, ShoppingBag, ArrowRight } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
}

export function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const router = useRouter();
  const cart = useCart();
  const { addItem } = useCartMutations();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingItem = cart.find((i) => i.productId === productId);
  const qtyInCart = existingItem?.quantity ?? 0;
  const isMaxInCart = stock > 0 && qtyInCart >= stock;

  const handleAdd = async () => {
    if (stock <= 0) return;
    if (isMaxInCart) {
      router.push("/cart");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await addItem(productId, 1);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      const errMsg = err?.message ?? "Failed to add to cart";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (stock <= 0) {
    return (
      <button
        disabled
        className="w-full py-3.5 rounded-xl bg-zinc-800 text-zinc-500 font-semibold text-base cursor-not-allowed border border-white/5"
      >
        Out of Stock
      </button>
    );
  }

  if (isMaxInCart) {
    return (
      <div className="w-full space-y-2">
        <Link
          href="/cart"
          className="w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all duration-200"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Already in Cart ({qtyInCart} of {stock} in stock)</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
        <p className="text-xs text-center text-zinc-400">
          You have added all available stock ({stock} unit{stock !== 1 ? "s" : ""}) to your cart.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <button
        onClick={handleAdd}
        disabled={loading}
        className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
          success
            ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
            : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20"
        } disabled:opacity-50`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Adding to Cart...
          </>
        ) : success ? (
          <>
            <Check className="w-5 h-5" />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            {qtyInCart > 0 ? `Add More (${qtyInCart} in Cart)` : "Add to Cart"}
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center justify-between gap-2 text-red-400 text-xs mt-1 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Link
            href="/cart"
            className="text-xs font-bold text-violet-400 hover:underline flex-shrink-0"
          >
            View Cart &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
