import { OrderDiscountRequest } from "./order-discount.request";
import { OrderLineItemRequest } from "./order-line-item.request";
import { OrderPaymentRequest } from "./order-payment.request";

export interface OrderRequest {
  company_id: number | null;
  store_id: number | null;
  status: string | null;
  price_type: string | null;
  tax_treatment: string | null;
  source_id: number | null;
  note: string | null;
  tags: string | null;
  customer_note: string | null;
  sale_note: string | null;
  account_code: string | null;
  account: string | null;
  assignee_code: string | null;
  channel_id: number | null;
  customer_id: number | null;
  fulfillment_status: string | null;
  packed_status: string | null;
  received_Status: string | null;
  payment_status: string | null;
  return_status: string | null;
  reference: string | null;
  url: string | null;
  total_line_amount_after_line_discount: number | null;
  total: number | null;
  order_discount_rate: number | null;
  order_discount_value: number | null;
  discount_reason: string | null;
  total_discount: number | null;
  total_tax: string | null;
  finalized_account_code: string | null;
  cancel_account_code: string | null;
  finish_account_code: string | null;
  finalized_on: string | null;
  cancelled_on: string | null;
  finished_on: string | null;
  currency: string | null;
  items: Array<OrderLineItemRequest>;
  discounts: Array<OrderDiscountRequest> | null;
  payments: Array<OrderPaymentRequest> | null;
  shipping_address: ShippingAddress | null;
  billing_address: BillingAddress | null;
  fulfillment: Array<FulFillmentRequest> | null;
  pre_payments: Array<OrderPaymentRequest> | null;
}

export interface FulFillmentRequest {
  store_id: number|null;
  account_code: string | null;
  assignee_code: string | null;
  delivery_type: string | null;
  status: string | null;
  partner_status: string | null;
  stockLocation_id: number | null;
  payment_status: string | null;
  total: number | null;
  total_tax: number | null;
  total_discount: number | null;
  total_quantity: number | null;
  stock_out_account_code: string | null;
  receive_account_code: string | null;
  cancel_account_code: string | null;
  receive_cancellation_account_code: string | null;
  packed_on: string | null;
  shipped_on: string | null;
  received_on: string | null;
  cancel: string | null;
  receive_cancellation_on: string | null;
  status_before_cancellation: string | null;
  discount_rate: number | null;
  discount_value: number | null;
  discount_amount: number | null;
  total_line_amount_after_line_discount: number | null;
  shipment: ShipmentRequest | null | undefined;
  billing_address: BillingAddress | null;
  items: Array<OrderLineItemRequest>;
  payments: Array<OrderPaymentRequest>;
}

export interface BillingAddress {
  default: boolean;
  name: string;
  email: string;
  phone: string;
  country_id: number;
  country: string;
  city_id: number;
  city: string;
  district_id: number;
  district: string;
  ward_id: number;
  ward: string;
  zip_code: string;
  full_address: string;
}

export interface ShippingAddress {
  default: boolean;
  name: string;
  email: string;
  phone: string;
  country_id: number;
  country: string;
  city_id: number;
  city: string;
  district_id: number;
  district: string;
  ward_id: number;
  ward: string;
  zip_code: string;
  full_address: string;
}

export interface ShipmentRequest {
  delivery_service_provider_id: number | null;
  delivery_service_provider_type: string | null;
  handover_id: number | null;
  service: number | null;
  who_paid: string | null;
  fee_type: string | null;
  fee_base_on: string | null;
  delivery_fee: number | null;
  shipping_fee_informed_to_customer: number|null;
  shipping_fee_paid_to_3pls: number|null;
  reference_status: string | null;
  reference_status_explanation: string | null;
  cancel_reason: string | null;
  tracking_code: string | null;
  tracking_url: string | null;
  received_date: string | null;
  sender_address_id: number | null;
  note_to_shipper: string | null;
  requirements: string | null;
  shipping_address: ShippingAddress | null;
}
