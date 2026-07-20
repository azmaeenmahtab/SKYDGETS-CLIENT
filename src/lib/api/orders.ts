import { apiGet, apiPost, apiPatch } from "./client";
import type { Order, CreateOrderInput } from "@/types/order";

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return apiPost<Order>("/orders", input);
}

export async function getOrders(): Promise<Order[]> {
  return apiGet<Order[]>("/orders");
}

export async function getOrderByNumber(orderNumber: string): Promise<Order> {
  return apiGet<Order>(`/orders/${orderNumber}`);
}

export async function updateOrderStatus(
  id: string,
  status: string,
  note?: string
): Promise<Order> {
  return apiPatch<Order>(`/orders/${id}/status`, { status, note });
}
