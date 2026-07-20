/**
 * Frontend order types — serialized (ObjectIds become strings, Dates become ISO strings).
 */

export interface Address {
  _id?: string;
  label?: string;
  fullName: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  titleSnapshot: string;
  imageSnapshot: string;
  priceSnapshot: number; // in poisha
  condition: string;
  quantity: number;
}

export interface StatusEvent {
  status: string;
  note?: string;
  changedAt: string; // ISO date string
  changedBy?: string;
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "returned";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "cod" | "bkash" | "nagad" | "card";

export interface Order {
  _id: string;
  orderNumber: string;
  userId?: string;
  guestContact?: { name: string; phone: string; email?: string };
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number; // in poisha
  shippingFee: number; // in poisha
  discount: number; // in poisha
  total: number; // in poisha
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentRef?: string;
  orderStatus: OrderStatus;
  statusHistory: StatusEvent[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  shippingAddress: Omit<Address, "_id" | "isDefault" | "label">;
  paymentMethod: PaymentMethod;
  guestContact?: { name: string; phone: string; email?: string };
  notes?: string;
}
