"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrderByNumber } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Clock, MapPin, CreditCard, Box, Calendar, User, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => getOrderByNumber(orderNumber),
    enabled: !!orderNumber,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col items-center justify-center px-4 pt-28 sm:pt-32 pb-16">
        <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white mb-2">Order Not Found</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">We couldn't retrieve the details for order {orderNumber}.</p>
        <Link
          href="/orders"
          className="px-8 py-3.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-extrabold rounded-full transition-all text-sm uppercase tracking-wider active:scale-95"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      {/* Background Spotlight */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-28 sm:pt-32 pb-16 sm:px-6 lg:px-8 w-full">
        {/* Navigation back */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white mt-2">
              Order Specification
            </h1>
            <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 mt-1">
              Order ID: <span className="text-zinc-950 dark:text-white font-bold">{order.orderNumber}</span>
            </p>
          </div>
          <span className={`px-4 py-1.5 border rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-center ${getStatusClass(order.orderStatus)}`}>
            Status: {order.orderStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Order Items & Delivery details */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Items Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <h2 className="text-lg font-bold flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <Box className="w-5 h-5" />
                Purchased Verified Items
              </h2>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="py-4 flex justify-between gap-4 items-start"
                  >
                    <div>
                      <p className="font-extrabold text-zinc-950 dark:text-white text-base">
                        {item.titleSnapshot}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold rounded-full capitalize">
                          {item.condition.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-extrabold text-zinc-950 dark:text-white text-base flex-shrink-0">
                      {formatPrice(item.priceSnapshot * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400 text-xs">
                  <span>Subtotal</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 dark:text-zinc-400 text-xs">
                  <span>Shipping Fee</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Free</span>
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex justify-between font-black text-xl text-zinc-950 dark:text-white">
                  <span>Total Amount</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Address & Payment Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 space-y-3 shadow-sm">
                <h3 className="font-bold text-zinc-950 dark:text-white flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  Shipping Address
                </h3>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 leading-relaxed">
                  <p className="font-bold text-zinc-900 dark:text-white text-sm">{order.shippingAddress.fullName}</p>
                  <p>Phone: {order.shippingAddress.phone}</p>
                  <p>{order.shippingAddress.addressLine}</p>
                  <p>
                    {order.shippingAddress.area}, {order.shippingAddress.district},{" "}
                    {order.shippingAddress.division}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 space-y-3 shadow-sm">
                <h3 className="font-bold text-zinc-950 dark:text-white flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  Payment Details
                </h3>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
                  <p>
                    Method: <span className="font-bold text-zinc-900 dark:text-white uppercase">{order.paymentMethod}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span>Payment Status:</span>
                    <span className="px-2.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-bold capitalize">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Status Timeline */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-xl shadow-black/5">
              <h2 className="text-lg font-bold flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <Clock className="w-5 h-5" />
                Status Timeline
              </h2>

              <div className="relative border-l border-zinc-200 dark:border-zinc-800 pl-6 space-y-6 ml-2 py-1">
                {order.statusHistory.map((event, idx) => (
                  <div key={idx} className="relative group">
                    {/* Event bullet point */}
                    <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 ring-4 ring-white dark:ring-zinc-900">
                      <span className="h-2 w-2 rounded-full bg-white" />
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-zinc-950 dark:text-white capitalize text-sm">
                          {event.status}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.changedAt).toLocaleString()}
                      </p>
                      {event.note && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/60 dark:border-zinc-800 italic flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-violet-500 mt-0.5 flex-shrink-0" />
                          <span>{event.note}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
