import { OrderLineItemRequest, OrderRequest } from "model/request/order.request";
import { OrderItemDiscountResponse, OrderResponse } from "model/response/order/order.response";

export interface OrderSplitModel extends OrderResponse {
  distributed_order_discount_custom?: number;
}

export interface LineItemOrderSplitModel {
  index: number;
  sku: string;
  variant: string;
  quantity: number;
  price: number;
  amount: number;
  available: number;
  store_id: number | null;
  store_name: string | null;
  discount_items: OrderItemDiscountResponse | null;
  distributed_order_discount: number;
  gifts?: LineItemGifts[];
}

interface LineItemGifts {
  sku: string;
  variant: string;
  available: number | null;
}
