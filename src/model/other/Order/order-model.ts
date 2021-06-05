import { BaseModel } from "../base-model";
export interface OrderModel extends BaseModel {
  seq?: number;
  reference_code?: string;
  company_id: number;
  store_id: number;
  store: string;
  status: string;
  price_type: string;
  tax_treatment: string;
  source_id: number;
  source: string;
  note: string;
  tags: string;
  payment_method_id?: number;
  payment_method?: string;
  expected_payment_method_id?: number;
  expected_delivery_provider_id?: number;
  expected_delivery_type?: string;
  customer_note: string;
  sale_note: string;
  account_code: string;
  account: string;
  assignee_code: string;
  assignee: string;
  channel_id: number;
  channel: string;
  customer_id: number;
  phone?: string;
  email?: string;
  billing_address_id?: number;
  shipping_address_id?: number;
  items: Array<OrderItemModel>;
  fulfillments: [];
  discounts: Array<OrderDiscountModel>;
  payments: Array<OrderPaymentModel>;
  total: number;
  total_line_amount_after_line_discount: number;
  order_discount_rate: number;
  order_discount_value: number;
  discount_reason: string;
  total_discount: number;
  total_tax: number;
  currency: string,
  total_amount_free_form: number;
  total_paid_amount: number;
}

export interface OrderDiscountModel {
  rate: number|null;
  value: number|null;
  amount: number;
  promotion_id: number|null;
  reason: string;
  source: string;
}

export interface OrderItemDiscountModel {
  rate: number;
  value: number;
  amount: number;
  promotion_id?: number;
  reason: string;
}

export interface OrderItemModel {
  id: number;
  sku: string;
  variant_id: number;
  variant: string;
  product_id: number;
  product: string;
  show_note: boolean;
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
  discount_items: Array<OrderItemDiscountModel>;
  discount_rate: number;
  discount_value: number;
  discount_amount: number;
  gifts: Array<OrderItemModel>;
}

export interface OrderPaymentModel {
  payment_method_id: number,
  payment_method: string,
  amount: number,
  reference: '',
  source: '',
  return_amount: number,
  paid_amount: number
  status: string,
  name?: string,
  code?: string,
  point?: number,
  customer_id: number,
  type: string,
  note: string,
}
