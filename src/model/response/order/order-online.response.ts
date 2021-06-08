import { OrderPaymentRequest } from 'model/request/order-payment.request';
import { ShippingAddress } from "model/other/Customer/customer-model";
import { OrderDiscountRequest } from "model/request/order-discount.request";
import { OrderLineItemRequest } from "model/request/order-line-item.request";
import { BillingAddress } from "model/request/order.request";

export interface OrderRespose {
  company_id: number | null,
  store_id: number | null,
  store: string | null,
  status: string | null,
  price_type: string | null,
  tax_treatment: string | null,
  source_id: number | null,
  note: string | null,
  tags: string | null,
  customer_note: string | null,
  sale_note: string | null,
  account_code: string | null,
  account: string | null,
  source: string | null,
  assignee_code: string | null,
  assignee: string | null,
  channel_id: number | null,
  channel: string | null,
  customer_id: number | null,
  fulfillment_status: string | null,
  packed_status: string | null,
  received_Status: string | null,
  payment_status: string | null,
  return_status: string | null,
  reference: string | null,
  url: string|null;
  total_line_amount_after_line_discount: number | null,
  total: number | null,
  order_discount_rate: number | null,
  order_discount_value: number | null,
  discount_reason: string | null,
  total_discount: number | null,
  total_tax: string | null,
  finalized_account_code: string | null,
  cancel_account_code: string | null,
  finish_account_code: string | null,
  finalized_on: string | null,
  cancelled_on: string | null,
  finished_on: string | null,
  currency: string | null,
  items: Array<OrderLineItemRequest>,
  discounts: Array<OrderDiscountRequest>,
  payments: Array<OrderPaymentRequest>,
  shipping_address: ShippingAddress | null,
  billing_address: BillingAddress | null,
}


export interface BillingAddressResponse {
  default: boolean,
  name: string,
  email: string,
  phone: string,
  country_id: number,
  country: string,
  city_id: number,
  city: string,
  district_id: number,
  district: string,
  ward_id: number,
  ward: string,
  zip_code: string,
  full_address: string
}

export interface ShippingAddressResponse {
  default: boolean,
  name: string,
  email: string,
  phone: string,
  country_id: number,
  country: string,
  city_id: number,
  city: string,
  district_id: number,
  district: string,
  ward_id: number,
  ward: string,
  zip_code: string,
  full_address: string
}