"use client";

import { useCart, useCartDispatch } from "@/hooks/useCart";

export default function CartPage() {
  const cart = useCart();
  const dispatch = useCartDispatch();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
        Your Cart
      </h1>
      {cart.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.productId} className="flex justify-between items-center p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-white">{item.title}</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Qty: {item.quantity}</p>
              </div>
              <button
                onClick={() => dispatch({ type: "remove", payload: { productId: item.productId } })}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => dispatch({ type: "clear" })}
            className="mt-4 px-4 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-950 dark:text-white rounded-lg transition-colors"
          >
            Clear Cart
          </button>
        </div>
      )}
    </div>
  );
}
