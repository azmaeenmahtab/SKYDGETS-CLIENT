"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCart } from "@/lib/api/cart";
import { createOrder } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";
import { ShieldCheck, Truck, CreditCard, AlertCircle, ShoppingCart, ArrowLeft } from "lucide-react";
import type { CreateOrderInput, PaymentMethod } from "@/types/order";

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, status: authStatus } = useAuth();

  // Cart query
  const { data: cart, isLoading: isCartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
  });

  const cartItems = cart?.items ?? [];
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.priceAtAdd * item.quantity,
    0
  );
  const shippingFee = 0; // Free shipping
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [addressLine, setAddressLine] = useState("");

  // Guest contact states
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  // Error/loading state
  const [error, setError] = useState<string | null>(null);

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: (data) => {
      // Clear cart cache client-side
      queryClient.setQueryData(["cart"], { items: [] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      // Redirect to confirmation page
      router.push(`/orders/confirm/${data.orderNumber}`);
    },
    onError: (err: any) => {
      setError(err?.message ?? "An error occurred during checkout. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    // Validate fields
    if (!fullName || !phone || !division || !district || !area || !addressLine) {
      setError("Please fill in all shipping address fields.");
      return;
    }

    const shippingAddress = {
      fullName,
      phone,
      division,
      district,
      area,
      addressLine,
    };

    let guestContact;
    if (authStatus !== "authenticated") {
      if (!guestName || !guestPhone) {
        setError("Please provide a contact name and phone number.");
        return;
      }
      guestContact = {
        name: guestName,
        phone: guestPhone,
        email: guestEmail || undefined,
      };
    }

    checkoutMutation.mutate({
      shippingAddress,
      paymentMethod,
      guestContact,
    });
  };

  if (isCartLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4">
        <ShoppingCart className="w-16 h-16 text-zinc-600 mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold mb-2">No items to checkout</h1>
        <p className="text-zinc-400 mb-6 text-center max-w-sm">
          Your cart is empty. Please add products to your cart before proceeding to checkout.
        </p>
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
    <div className="min-h-screen bg-zinc-950 text-white py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Navigation back */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight mt-3">Checkout</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-400 font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Contact Information for Guests */}
            {authStatus !== "authenticated" && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-violet-400">
                  <ShieldCheck className="w-5 h-5" />
                  Contact Information
                </h2>
                <p className="text-xs text-zinc-400">
                  You are checking out as a guest. Please provide contact details for updates.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="e.g. +8801700000000"
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* 2. Shipping Address */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-violet-400">
                <Truck className="w-5 h-5" />
                Shipping Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient's name"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 01712345678"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Division *
                  </label>
                  <input
                    type="text"
                    required
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    placeholder="e.g. Dhaka"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Dhaka"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                    Area *
                  </label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Dhanmondi"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Address Line *
                </label>
                <textarea
                  required
                  rows={3}
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. House 12, Road 5, Block B"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-violet-400">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h2>

              <div className="space-y-3">
                {/* COD */}
                <label className="flex items-center gap-4 p-4 rounded-xl border border-violet-500/30 bg-violet-500/5 cursor-pointer hover:bg-violet-500/10 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="w-4 h-4 text-violet-600 focus:ring-violet-500 border-zinc-700 bg-zinc-800"
                  />
                  <div>
                    <p className="font-semibold text-white">Cash on Delivery (COD)</p>
                    <p className="text-xs text-zinc-400">Pay with cash upon delivery of your items.</p>
                  </div>
                </label>

                {/* bKash */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      disabled
                      name="paymentMethod"
                      value="bkash"
                      className="w-4 h-4 text-violet-600 border-zinc-700 bg-zinc-800"
                    />
                    <div>
                      <p className="font-semibold text-white">bKash</p>
                      <p className="text-xs text-zinc-400">Pay directly using your bKash wallet.</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-zinc-800 rounded-md font-semibold text-zinc-400">
                    Coming Soon
                  </span>
                </div>

                {/* Nagad */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      disabled
                      name="paymentMethod"
                      value="nagad"
                      className="w-4 h-4 text-violet-600 border-zinc-700 bg-zinc-800"
                    />
                    <div>
                      <p className="font-semibold text-white">Nagad</p>
                      <p className="text-xs text-zinc-400">Pay directly using your Nagad wallet.</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-zinc-800 rounded-md font-semibold text-zinc-400">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <h3 className="font-bold text-lg text-white">Order Summary</h3>

              {/* Items */}
              <div className="divide-y divide-white/10 max-h-64 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.productId} className="py-3 flex justify-between gap-4 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{item.title}</p>
                      <p className="text-xs text-zinc-400 capitalize">
                        Qty: {item.quantity} · {item.condition.replace(/_/g, " ")}
                      </p>
                    </div>
                    <span className="font-bold text-white whitespace-nowrap">
                      {formatPrice(item.priceAtAdd * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping Fee</span>
                  <span className="text-emerald-400 font-semibold">Free</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between font-extrabold text-lg text-white">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="submit"
                disabled={checkoutMutation.isPending}
                className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-extrabold rounded-xl transition-colors shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing Order...
                  </>
                ) : (
                  "Place Order (COD)"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
