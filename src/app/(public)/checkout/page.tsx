"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCart } from "@/lib/api/cart";
import { createOrder } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  AlertCircle, 
  ShoppingCart, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles
} from "lucide-react";
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
      <div className="min-h-screen bg-white text-zinc-900 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center px-4 pt-28 sm:pt-32 pb-16">
        <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center mb-6">
          <ShoppingCart className="w-10 h-10 text-violet-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-950 mb-2">No items to checkout</h1>
        <p className="text-zinc-500 mb-6 text-center max-w-sm text-sm leading-relaxed">
          Your cart is empty. Please add products to your cart before proceeding to checkout.
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
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.06),rgba(255,255,255,0))]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-28 sm:pt-32 pb-16 sm:px-6 lg:px-8 w-full">
        {/* Navigation back */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 mt-3">
            Checkout & Fulfillment
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-600">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-semibold">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Info */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Contact Information for Guests */}
            {authStatus !== "authenticated" && (
              <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
                <h2 className="text-xl font-bold flex items-center gap-2 text-violet-600">
                  <ShieldCheck className="w-5 h-5" />
                  Contact Information
                </h2>
                <p className="text-xs text-zinc-500">
                  You are checking out as a guest. Please provide contact details for updates.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="e.g. +8801700000000"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* 2. Shipping Address */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
              <h2 className="text-xl font-bold flex items-center gap-2 text-violet-600">
                <Truck className="w-5 h-5" />
                Shipping Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient's name"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 01712345678"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Division *
                  </label>
                  <input
                    type="text"
                    required
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    placeholder="e.g. Dhaka"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Dhaka"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Area/Thana *
                  </label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Gulshan"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Street Address & House/Flat No. *
                </label>
                <textarea
                  required
                  rows={2}
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. House 12, Road 5, Block B"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none font-medium"
                />
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
              <h2 className="text-xl font-bold flex items-center gap-2 text-violet-600">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-violet-600 bg-violet-500/5 text-violet-600 font-semibold"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-1"
                  />
                  <div>
                    <span className="block text-sm font-bold text-zinc-950">Cash on Delivery</span>
                    <span className="block text-xs text-zinc-500 mt-0.5">
                      Pay in cash when your verified gadget is delivered to your doorstep.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "border-violet-600 bg-violet-500/5 text-violet-600 font-semibold"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="mt-1"
                  />
                  <div>
                    <span className="block text-sm font-bold text-zinc-950">Card / Mobile Banking</span>
                    <span className="block text-xs text-zinc-500 mt-0.5">
                      Pay securely via bKash, Nagad, Visa, or Mastercard.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-white border border-zinc-200/80 rounded-3xl p-6 space-y-6 shadow-xl shadow-black/5">
              <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">
                Order Review
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between items-center text-sm pb-3 border-b border-zinc-100"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-zinc-950 text-xs truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-zinc-500 capitalize">
                        Qty: {item.quantity} • {item.condition.replace(/_/g, " ")}
                      </p>
                    </div>
                    <span className="font-bold text-zinc-950 text-xs flex-shrink-0">
                      {formatPrice(item.priceAtAdd * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-xs text-zinc-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-zinc-950">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-emerald-600 uppercase tracking-wider">Free</span>
                </div>
                <div className="flex justify-between text-base font-black text-zinc-950 pt-2 border-t border-zinc-100">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={checkoutMutation.isPending}
                className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold rounded-full transition-all shadow-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {checkoutMutation.isPending ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Place Order ({formatPrice(total)})</span>
                  </>
                )}
              </button>

              <div className="space-y-2 text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Encrypted 256-bit Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span>Insured Express Shipping Included</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
