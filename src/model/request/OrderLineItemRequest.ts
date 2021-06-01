import { OrderItemDiscountRequest } from "./OrderItemDiscountRequest";

export interface OrderLineItemRequest {
  sku: string;
  variant_id: number;
  variant: string;
  product_id: number;
  product: string;
  variant_barcode: string;
  product_type: string;
  quantity: number;
  price: number;
  amount: number;
  note: string;
  type: string;
  variant_image: string;
  unit: string;
  warranty: string;
  tax_rate: number;
  tax_include: boolean;
  is_composite: boolean;
  line_amount_after_line_discount: number;
  discount_items: Array<OrderItemDiscountRequest>;
  discount_rate: number;
  discount_value: number;
  discount_amount: number;
}