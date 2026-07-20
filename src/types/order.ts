// Order type definitions — mirrors backend order.types.ts
export type PaymentMethod = "cod" | "bkash" | "nagad" | "card";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "returned";

export interface OrderItem {
  productId: string;
  titleSnapshot: string;
  imageSnapshot: string;
  priceSnapshot: number;
  condition: string;
  quantity: number;
}

export interface StatusEvent {
  status: string;
  note?: string;
  changedAt: string;
  changedBy?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: StatusEvent[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
