"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getOrders } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Calendar, Eye, ClipboardList } from "lucide-react";

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case "placed":
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "confirmed":
        return "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
      case "shipped":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "delivered":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "cancelled":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      default:
        return "bg-zinc-500/10 border-zinc-500/20 text-zinc-400";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-violet-400" />
            Order History
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            View and track your previous purchases.
          </p>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white/5 animate-pulse border border-white/5"
              />
            ))}
          </div>
        )}

        {!isLoading && (!orders || orders.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">No orders yet</h2>
            <p className="text-sm text-zinc-400 mb-6 max-w-xs">
              When you purchase items, your order history will appear here.
            </p>
            <Link
              href="/products"
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!isLoading && orders && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-200"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-white tracking-wider text-sm md:text-base">
                      {order.orderNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 border rounded-full text-xs font-semibold capitalize ${getStatusClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} Item(s)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t border-white/5 md:border-none">
                  <div>
                    <p className="text-xs text-zinc-400 text-left md:text-right">Total Amount</p>
                    <p className="text-base font-extrabold text-white">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Details
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
