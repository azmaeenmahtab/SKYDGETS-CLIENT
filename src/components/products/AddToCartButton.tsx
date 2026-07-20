"use client";

import { useState } from "react";
import { useCartMutations } from "@/hooks/useCart";
import { ShoppingCart, Check, Loader2, AlertCircle } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
}

export function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const { addItem } = useCartMutations();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (stock <= 0) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await addItem(productId, 1);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err?.message ?? "Failed to add to cart");
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  if (stock <= 0) {
    return (
      <button
        disabled
        className="w-full py-3 rounded-xl bg-zinc-800 text-zinc-500 font-semibold text-base cursor-not-allowed border border-white/5"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="w-full space-y-2">
      <button
        onClick={handleAdd}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 ${
          success
            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
            : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/10"
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
            Added!
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
