"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Home, ShoppingBag, Truck, ShieldCheck, Sparkles } from "lucide-react";
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
      <div className="min-h-screen bg-white text-zinc-900 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center px-4 pt-28 sm:pt-32 pb-16">
        <h1 className="text-2xl font-extrabold mb-2 text-zinc-950">Order Not Found</h1>
        <p className="text-zinc-500 mb-6 text-center max-w-sm text-sm">
          We couldn't retrieve the details for order {orderNumber}.
        </p>
        <Link
          href="/products"
          className="px-8 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold rounded-full transition-all shadow-lg text-sm uppercase tracking-wider active:scale-95"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-zinc-900">
      {/* Background Spotlight */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.08),rgba(255,255,255,0))]" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-28 sm:pt-32 pb-16 sm:px-6 lg:px-8 flex flex-col items-center w-full">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </div>

        {/* Headings */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-center text-zinc-950 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-zinc-600 text-center mb-8 max-w-md text-sm sm:text-base">
          Thank you for your purchase. Your order number is{" "}
          <span className="text-zinc-950 font-extrabold tracking-wider">{order.orderNumber}</span>.
        </p>

        {/* Order Details Card */}
        <div className="w-full bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 space-y-6 mb-8 shadow-xl shadow-black/5">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
              <Truck className="w-4 h-4 text-violet-600" />
              Delivery Status
            </span>
            <span className="px-3.5 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-600 rounded-full text-xs font-bold uppercase tracking-wider">
              {order.orderStatus}
            </span>
          </div>

          {/* Items List */}
          <div className="divide-y divide-zinc-100">
            {order.items.map((item) => (
              <div key={item.productId} className="py-3 flex justify-between gap-4 text-sm">
                <div>
                  <p className="font-extrabold text-zinc-950">{item.titleSnapshot}</p>
                  <p className="text-xs text-zinc-500 capitalize mt-0.5">
                    Qty: {item.quantity} · {item.condition.replace(/_/g, " ")}
                  </p>
                </div>
                <span className="font-bold text-zinc-950">
                  {formatPrice(item.priceSnapshot * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-zinc-100 pt-4 flex justify-between font-black text-xl text-zinc-950">
            <span>Total Paid (COD)</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href={`/orders/${order.orderNumber}`}
            className="px-8 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold rounded-full text-center transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Track Order Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/products"
            className="px-8 py-3.5 bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold rounded-full text-center transition-all flex items-center justify-center gap-2 shadow-lg text-sm uppercase tracking-wider active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
