import { BaseObject } from "model/base/base.response";

export interface OrderResponse extends BaseObject {
  company_id: number | null;
  company: string | null;
  store_id: number | null;
  store: string | null;
  store_phone_number: string | null;
  store_full_address: string | null;
  status: string | null;
  price_type: string | null;
  tax_treatment: string | null;
  source_id: number | null;
  source: string | null;
  note: string | null;
  tags: string | null;
  customer_note: string | null;
  sale_note: string | null;
  account_code: string | null;
  account: string | null;
  assignee_code: string | null;
  assignee: string | null;
  channel_id: number | null;
  channel: string| null;
  customer_id: number | null;
  customer: string | null;
  customer_phone_number: string | null;
  customer_email: string | null;
  fulfillment_status: string | null;
  packed_status: string | null;
  received_status: string | null;
  payment_status: string | null;
  return_status: string | null;
  reference: string | null;
  url: string | null;
  total_line_amount_after_line_discount: number;
  shipping_fee_informed_to_customer: number | null;
  total: number;
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
  items: Array<OrderLineItemResponse>;
  discounts: Array<OrderDiscountResponse> | null;
  payments: Array<OrderPaymentResponse> | null;
  total_paid?: number | null;
  shipping_address: ShippingAddress | null;
  billing_address: BillingAddress | null;
  fulfillments: Array<FulFillmentResponse> | null | undefined;
}

export interface OrderLineItemResponse {
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
  line_amount_after_line_discount: number;
  discount_items: Array<OrderItemDiscountResponse>;
  discount_rate: number;
  discount_value: number;
  discount_amount: number;
  position?: number;
  gifts: Array<OrderLineItemResponse>;
}

export interface FulFillmentResponse {
  id: number | null;
  code:string | null;
  store_id: number|null;
  account_code: string | null;
  assignee_code: string | null;
  delivery_type: string | null;
  status: string | null;
  partner_status: string | null;
  stock_location_id: number | null;
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
  export_on: string | null;
  received_on: string | null;
  cancel: string | null;
  receive_cancellation_on: string | null;
  status_before_cancellation: string | null;
  discount_rate: number | null;
  discount_value: number | null;
  discount_amount: number | null;
  total_line_amount_after_line_discount: number | null;
  shipment: ShipmentResponse | null | undefined;
  billing_address: BillingAddress | null;
  items: Array<OrderLineItemResponse>;
  payments: Array<OrderPaymentResponse>;
  created_date: string | null;
}

export interface OrderDiscountResponse {
  rate: number|null;
  value: number|null;
  amount: number | null;
  promotion_id: number|null;
  reason: string | null;
  source: string | null;
}

export interface OrderItemDiscountResponse {
  rate: number|null;
  value: number;
  amount: number|null;
  promotion_id?: number | null;
  reason: string | null;
}

export interface OrderPaymentResponse extends BaseObject {
  payment_method_id: number,
  payment_method: string,
  amount: number,
  reference: string,
  source: string,
  paid_amount: number,
  return_amount: number,
  status: string,
  name?: string,
  point?: number,
  customer_id: number,
  type: string,
  note: string,
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

export interface ShipmentResponse extends BaseObject {
  delivery_service_provider_id: number | null;
  delivery_service_provider_type: string | null;
  shipper_code: string | null;
  shipper_name: string | null;
  handover_id: number | null;
  service: number | null;
  who_paid: string | null;
  fee_type: string | null;
  fee_base_on: string | null;
  delivery_fee: number | null;
  shipping_fee_informed_to_customer: number|null;
  shipping_fee_paid_to_three_pls: number|null;
  expected_received_date:string|null;
  reference_status: string | null;
  reference_status_explanation: string | null;
  cancel_reason: string | null;
  tracking_code: string | null;
  tracking_url: string | null;
  received_date: string | null;
  sender_address_id: number | null;
  note_to_shipper: string | null;
  requirements: string | null;
  requirements_name: string | null;
  shipping_address: ShippingAddress | null;
  fulfillment_id:string|null;
  cod: number 
}

export interface DeliveryServiceResponse {
  id: number;
  code: string;
  name: string;
  logo: string;
}

export interface ShippingGHTKResponse {
  name: string;
  fee: number;
  insurance_fee: number;
  delivery_type: string;
}