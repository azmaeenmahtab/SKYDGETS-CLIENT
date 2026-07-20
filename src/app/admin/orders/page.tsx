"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, updateOrderStatus } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";
import { ClipboardList, Calendar, User, Phone, CheckCircle, RefreshCw, AlertCircle, Edit } from "lucide-react";
import type { OrderStatus } from "@/types/order";

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getOrders,
  });

  // State to manage which order is being edited
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("placed");
  const [statusNote, setStatusNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Status transition mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) =>
      updateOrderStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setEditingOrderId(null);
      setStatusNote("");
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.message ?? "Failed to update order status.");
    },
  });

  const handleUpdateClick = (id: string, currentStatus: OrderStatus) => {
    setEditingOrderId(id);
    setNewStatus(currentStatus);
    setStatusNote("");
    setError(null);
  };

  const handleSaveUpdate = (id: string) => {
    updateMutation.mutate({
      id,
      status: newStatus,
      note: statusNote || undefined,
    });
  };

  const getStatusColor = (status: string) => {
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-violet-400" />
              Manage Orders
            </h1>
            <p className="text-sm text-zinc-400 mt-2">
              Update status, view history, and process order fulfillment.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl transition-colors self-start sm:self-center"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-400 font-medium">{error}</div>
          </div>
        )}

        {/* Loading state */}
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

        {/* Empty state */}
        {!isLoading && (!orders || orders.length === 0) && (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <ClipboardList className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-1">No orders found</h2>
            <p className="text-sm text-zinc-400">There are no orders placed in the system yet.</p>
          </div>
        )}

        {/* Orders Table/List */}
        {!isLoading && orders && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const isEditing = editingOrderId === order._id;
              const customerName = order.guestContact?.name || order.shippingAddress.fullName;
              const customerPhone = order.guestContact?.phone || order.shippingAddress.phone;

              return (
                <div
                  key={order._id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1">
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">
                          Order Number
                        </p>
                        <span className="font-extrabold text-white tracking-wider text-sm">
                          {order.orderNumber}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">
                          Customer
                        </p>
                        <div className="text-sm text-zinc-300">
                          <p className="font-semibold text-white flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-zinc-400" />
                            {customerName}
                          </p>
                          <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {customerPhone}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">
                          Date & Quantity
                        </p>
                        <div className="text-sm text-zinc-300">
                          <p className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} Item(s)
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">
                          Payment & Total
                        </p>
                        <div className="text-sm">
                          <p className="font-bold text-white">{formatPrice(order.total)}</p>
                          <p className="text-xs text-zinc-500 mt-0.5 uppercase">
                            {order.paymentMethod} · {order.paymentStatus}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Status */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:self-center self-start">
                      {!isEditing ? (
                        <>
                          <span className={`px-3 py-1 border rounded-full text-xs font-semibold capitalize text-center ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                          <button
                            onClick={() => handleUpdateClick(order._id, order.orderStatus)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Update Status
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-zinc-900 border border-white/10 p-2.5 rounded-xl">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                            className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                          >
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="return_requested">Return Requested</option>
                            <option value="returned">Returned</option>
                          </select>

                          <input
                            type="text"
                            placeholder="Add brief note..."
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none min-w-[120px]"
                          />

                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSaveUpdate(order._id)}
                              disabled={updateMutation.isPending}
                              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingOrderId(null)}
                              className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
