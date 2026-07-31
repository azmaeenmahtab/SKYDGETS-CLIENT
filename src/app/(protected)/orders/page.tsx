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
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "confirmed":
        return "bg-indigo-50 border-indigo-200 text-indigo-700";
      case "shipped":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "delivered":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "cancelled":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-zinc-100 border-zinc-200 text-zinc-700";
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-zinc-900">
      {/* Background Spotlight */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-28 sm:pt-32 pb-16 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-violet-500/10 text-violet-600 border border-violet-500/20 mb-3">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>ORDER HISTORY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
            Your Previous Purchases
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Track fulfillment status, view order summaries, and inspect verified items.
          </p>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-3xl bg-zinc-100 animate-pulse border border-zinc-200/60"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!orders || orders.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-zinc-200/80 rounded-3xl shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-zinc-950 mb-2">No orders placed yet</h2>
            <p className="text-sm text-zinc-500 mb-8 max-w-sm leading-relaxed">
              When you purchase certified gadgets on SKYDGETS, your order history will appear here.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold rounded-full transition-all shadow-lg text-sm uppercase tracking-wider active:scale-95 cursor-pointer"
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
                className="group flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 bg-white border border-zinc-200/80 rounded-3xl hover:border-zinc-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-extrabold text-zinc-950 tracking-wider text-base">
                      {order.orderNumber}
                    </span>
                    <span className={`px-3 py-0.5 border rounded-full text-xs font-bold uppercase tracking-wider ${getStatusClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} Item(s)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t border-zinc-100 md:border-none">
                  <div>
                    <p className="text-xs text-zinc-400 text-left md:text-right font-medium">Total Amount</p>
                    <p className="text-lg font-black text-zinc-950">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold rounded-full transition-all cursor-pointer active:scale-95"
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
