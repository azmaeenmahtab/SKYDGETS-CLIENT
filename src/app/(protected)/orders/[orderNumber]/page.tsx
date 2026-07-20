"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrderByNumber } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Clock, MapPin, CreditCard, Box, Calendar, User, MessageSquare } from "lucide-react";

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
          href="/orders"
          className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Navigation back */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight mt-3">
              Order Detail
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Order Number: <span className="text-white font-semibold">{order.orderNumber}</span>
            </p>
          </div>
          <span className={`px-4 py-1.5 border rounded-full text-sm font-semibold capitalize self-start sm:self-center ${getStatusClass(order.orderStatus)}`}>
            Status: {order.orderStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Order Items & Delivery details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-violet-400">
                <Box className="w-5 h-5" />
                Ordered Items
              </h2>

              <div className="divide-y divide-white/5">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="py-4 flex justify-between gap-4 items-start"
                  >
                    <div>
                      <p className="font-semibold text-white text-sm md:text-base">
                        {item.titleSnapshot}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-white/10 text-zinc-400 rounded-full capitalize">
                          {item.condition.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-zinc-400">
                          Quantity: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-white whitespace-nowrap text-sm md:text-base">
                      {formatPrice(item.priceSnapshot * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping Fee</span>
                  <span className="text-emerald-400 font-semibold">Free</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between font-extrabold text-lg text-white">
                  <span>Total Amount</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Address & Payment Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-violet-400" />
                  Shipping Address
                </h3>
                <div className="text-sm text-zinc-300 space-y-1">
                  <p className="font-semibold text-white">{order.shippingAddress.fullName}</p>
                  <p>Phone: {order.shippingAddress.phone}</p>
                  <p>{order.shippingAddress.addressLine}</p>
                  <p>
                    {order.shippingAddress.area}, {order.shippingAddress.district},{" "}
                    {order.shippingAddress.division}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-violet-400" />
                  Payment Details
                </h3>
                <div className="text-sm text-zinc-300 space-y-1.5">
                  <p>
                    Method: <span className="font-semibold text-white uppercase">{order.paymentMethod}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    Status:{" "}
                    <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold capitalize">
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Status Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-violet-400">
                <Clock className="w-5 h-5" />
                Status Timeline
              </h2>

              <div className="relative border-l border-white/10 pl-6 space-y-6 ml-2 py-1">
                {order.statusHistory.map((event, idx) => (
                  <div key={idx} className="relative group">
                    {/* Event bullet point */}
                    <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 ring-4 ring-zinc-950">
                      <span className="h-2 w-2 rounded-full bg-white" />
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white capitalize text-sm">
                          {event.status}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.changedAt).toLocaleString()}
                      </p>
                      {event.note && (
                        <p className="text-xs text-zinc-400 mt-2 p-2 bg-white/5 rounded-lg border border-white/5 italic flex items-start gap-1">
                          <MessageSquare className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />
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
