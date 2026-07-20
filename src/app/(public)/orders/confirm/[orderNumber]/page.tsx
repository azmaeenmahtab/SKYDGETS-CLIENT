"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Home, ShoppingBag, Truck } from "lucide-react";
import { getOrderByNumber } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => getOrderByNumber(orderNumber),
    enabled: !!orderNumber,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-zinc-400 mb-6">We couldn't retrieve the details for order {orderNumber}.</p>
        <Link
          href="/products"
          className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        </div>

        {/* Headings */}
        <h1 className="text-3xl font-extrabold tracking-tight text-center mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-zinc-400 text-center mb-8 max-w-md">
          Thank you for your purchase. Your order number is{" "}
          <span className="text-white font-bold tracking-wider">{order.orderNumber}</span>.
        </p>

        {/* Order Details Card */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6 mb-8">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-violet-400" />
              Delivery Status
            </span>
            <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full text-xs font-semibold capitalize">
              {order.orderStatus}
            </span>
          </div>

          {/* Items List */}
          <div className="divide-y divide-white/5">
            {order.items.map((item) => (
              <div key={item.productId} className="py-3 flex justify-between gap-4 text-sm">
                <div>
                  <p className="font-semibold text-white">{item.titleSnapshot}</p>
                  <p className="text-xs text-zinc-400 capitalize">
                    Qty: {item.quantity} · {item.condition.replace(/_/g, " ")}
                  </p>
                </div>
                <span className="font-bold text-white">
                  {formatPrice(item.priceSnapshot * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-white/10 pt-4 flex justify-between font-extrabold text-lg text-white">
            <span>Total Paid (COD)</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href={`/orders/${order.orderNumber}`}
            className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-center transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Track Order Details
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/products"
            className="px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-center transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-600/10"
          >
            <Home className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
