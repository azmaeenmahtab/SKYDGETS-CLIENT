"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getOrders } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Calendar, Eye, ClipboardList, ArrowRight, Sparkles } from "lucide-react";

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case "placed":
        return "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400";
      case "confirmed":
        return "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400";
      case "shipped":
        return "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400";
      case "delivered":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
      case "cancelled":
        return "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400";
      default:
        return "bg-zinc-500/10 border-zinc-500/20 text-zinc-600 dark:text-zinc-400";
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      {/* Background Spotlight */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-28 sm:pt-32 pb-16 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 mb-3">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>ORDER HISTORY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
            Your Previous Purchases
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track fulfillment status, view order summaries, and inspect verified items.
          </p>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-3xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200/60 dark:border-zinc-800"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!orders || orders.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-950 dark:text-white mb-2">No orders placed yet</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm leading-relaxed">
              When you purchase certified gadgets on SKYDGETS, your order history will appear here.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-extrabold rounded-full transition-all shadow-lg text-sm uppercase tracking-wider active:scale-95"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Orders list */}
        {!isLoading && orders && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-extrabold text-zinc-950 dark:text-white tracking-wider text-base">
                      {order.orderNumber}
                    </span>
                    <span className={`px-3 py-0.5 border rounded-full text-xs font-bold uppercase tracking-wider ${getStatusClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} Item(s)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t border-zinc-100 dark:border-zinc-800 md:border-none">
                  <div>
                    <p className="text-xs text-zinc-400 text-left md:text-right font-medium">Total Amount</p>
                    <p className="text-lg font-black text-zinc-950 dark:text-white">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-bold rounded-full transition-all cursor-pointer active:scale-95"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
