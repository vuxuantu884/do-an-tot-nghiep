import { OrderLineItemResponse } from "model/response/order/order.response";
import { Moment } from "moment";
export interface OrderRequest {
  action: string | null;
  store_id: number | null;
  price_type: string | null;
  tax_treatment: string | null;
  source_id: number | null;
  note: string | null;
  tags: string | null;
  customer_note: string | null;
  account_code?: string | null;
  assignee_code: string | null;
  customer_id?: number | null;
  reference: string | null;
  url: string | null;
  total_line_amount_after_line_discount: number | null;
  total: number | null;
  total_discount: number | null;
  total_tax: string | null;
  currency: string | null;
  delivery_service_provider_id: number | null;
  delivery_fee: number | null;
  shipper_code: string | null;
  shipper_name: string | null;
  shipping_fee_informed_to_customer: number | null;
  shipping_fee_paid_to_three_pls: number | null;
  dating_ship?: Moment;
  requirements: string | null;
  items: Array<OrderLineItemRequest>;
  discounts: Array<OrderDiscountRequest> | null;
  shipping_address: ShippingAddress | null;
  billing_address: BillingAddress | null;
  fulfillments: Array<FulFillmentRequest> | null;
  payments: Array<OrderPaymentRequest> | null;
}

export interface FulFillmentRequest {
  store_id: number | null;
  account_code?: string | null;
  assignee_code: string | null;
  delivery_type: string | null;
  stock_location_id: number | null;
  payment_status: string | null;
  total: number | null;
  total_tax: number | null;
  total_discount: number | null;
  total_quantity: number | null;
  discount_rate: number | null;
  discount_value: number | null;
  discount_amount: number | null;
  total_line_amount_after_line_discount: number | null;
  shipment: ShipmentRequest | null | undefined;
  items: Array<OrderLineItemRequest>;
}

export interface UpdateFulFillmentRequest {
  id: number | null;
  order_id: number | null;
  store_id: number | null | undefined;
  account_code?: string | null | undefined;
  assignee_code: string | null | undefined;
  delivery_type: string | null | undefined;
  stock_location_id: number | null | undefined;
  payment_status: string | null;
  total: number | null | undefined;
  total_tax: number | null;
  total_discount: number | null;
  total_quantity: number | null;
  discount_rate: number | null;
  discount_value: number | null;
  discount_amount: number | null;
  total_line_amount_after_line_discount: number | null;
  shipment: UpdateShipmentRequest | null | undefined;
  items: Array<OrderLineItemResponse> | null | undefined;
  shipping_fee_informed_to_customer: number | null;
}

export interface UpdateLineFulFillment {
  order_id: number | null;
  fulfillment: UpdateFulFillmentRequest;
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
  shipper_code: string | null;
  shipper_name: string | null;
  handover_id: number | null;
  service: number | null;
  fee_type: string | null;
  fee_base_on: string | null;
  delivery_fee: number | null;
  shipping_fee_informed_to_customer: number | null;
  shipping_fee_paid_to_three_pls: number | null;
  expected_received_date?: string | null;
  reference_status: string | null;
  reference_status_explanation: string | null;
  cod: number | null;
  cancel_reason: string | null;
  tracking_code: string | null;
  tracking_url: string | null;
  received_date: string | null;
  sender_address_id: number | null;
  note_to_shipper: string | null;
  requirements: string | null;
}

export interface UpdateShipmentRequest {
  order_id: number | null;
  code: string | null | undefined;
  delivery_service_provider_id: number | null;
  delivery_service_provider_type: string | null;
  shipper_code: string | null;
  shipper_name: string | null;
  handover_id: number | null;
  service: number | null;
  fee_type: string | null;
  fee_base_on: string | null;
  delivery_fee: number | null;
  shipping_fee_informed_to_customer: number | null;
  shipping_fee_paid_to_three_pls: number | null;
  cod: number | null | undefined;
  dating_ship?: Moment;
  expected_received_date?: string | null;
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
  fulfillment_id: string | null | undefined;
}

export interface OrderPaymentRequest {
  payment_method_id: number;
  payment_method: string;
  amount: number;
  reference: string;
  source: string;
  paid_amount: number;
  return_amount: number;
  status: string;
  name?: string;
  code?: string;
  point?: number;
  customer_id: number | null;
  type: string;
  note: string;
}

export interface UpdateOrderPaymentRequest {
  order_id: number | null;
  payment_method_id: number;
  payment_method: string;
  amount: number;
  reference: string;
  source: string;
  paid_amount: number;
  return_amount: number;
  status: string;
  name?: string;
  code?: string;
  point?: number;
  customer_id: number | null;
  type: string;
  note: string;
}

export interface UpdatePaymentRequest {
  payments: Array<UpdateOrderPaymentRequest>;
  fulfillments: Array<UpdateFulFillmentRequest> | null | undefined;
}

export interface OrderLineItemRequest {
  id: number;
  sku: string;
  variant_id: number;
  variant: string;
  show_note: boolean;
  variant_barcode: string;
  product_id: number;
  product_type: string;
  quantity: number;
  price: number;
  amount: number;
  note: string;
  type: string;
  variant_image: string;
  unit: string;
  weight: number;
  weight_unit: string;
  warranty: string;
  tax_rate: number;
  tax_include: boolean;
  composite: boolean;
  product: string;
  is_composite: boolean;
  line_amount_after_line_discount: number;
  discount_items: Array<OrderItemDiscountRequest>;
  discount_rate: number;
  discount_value: number;
  discount_amount: number;
  position?: number;
  gifts: Array<OrderLineItemRequest>;
}

export interface OrderItemDiscountRequest {
  rate: number;
  value: number;
  amount: number;
  promotion_id?: number;
  reason: string | null;
}

export interface OrderDiscountRequest {
  rate: number | null;
  value: number | null;
  amount: number | null;
  promotion_id: number | null;
  reason: string | null;
  source: string | null;
}

export interface UpdateFulFillmentStatusRequest {
  order_id: number | null | undefined;
  fulfillment_id: number | null;
  status: string | null;
}

export interface ShippingGHTKRequest {
  pick_address?: string | null;
  pick_province?: string | null;
  pick_district?: string | null;
  province?: string | null;
  district?: string | null;
  address?: string | null;
  weight?: number | null;
  value?: number | null;
  transport?: string | null;
}
