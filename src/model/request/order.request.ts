import { OrderLineItemResponse, OrderResponse } from "model/response/order/order.response";
import { Moment } from "moment";
export interface OrderRequest {
  action: string | null;
  store_id: number | null;
  company_id: number | null;
  price_type: string | null;
  tax_treatment: string | null;
  source_id: number | null;
  source_code?:string|null;
  source?:string|null;
  note: string | null;
  tags: string | null;
  customer_note: string | null;
  account_code?: string | null;
  assignee_code: string | null;
  marketer_code?: string | null;
  coordinator_code?: string | null;
  customer_id?: number | null;
  customer_address?: string | null;
  customer_ward?: string | null;
  customer_district?: string | null;
  customer_city?: string | null;
  reference_code: string | null;
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
  channel_id?: number | null;
  finalized?: boolean;
  sub_status_code?: string; 
	automatic_discount?: boolean;
  export_bill?: boolean;
}

export interface ReturnRequest extends OrderRequest {
  reason_id: number;
  reason_name: string | null;
  reason: string | null;
  sub_reason_id: string|null;
  received: boolean;
  order_returns?: any[];
  store:string;
  store_code:string;
  store_phone_number:string;
  store_full_address:string;
  type: string;
}

export interface ExchangeRequest extends OrderRequest {
  order_return_id: number;
}

export interface FulFillmentRequest {
  id?: number | null;
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
  action?: string | null;
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
  second_phone?:string|null;
}

export interface ShipmentRequest {
  delivery_service_provider_id: number | null;
  delivery_service_provider_type: string | null;
  delivery_transport_type?: string | null;
  shipper_code: string | null;
  shipper_name: string | null;
  handover_id: number | null;
  service: string | null;
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
  sender_address?: string | null;
  shipping_address?: string | null;
  office_time: boolean | null;
}

export interface UpdateShipmentRequest {
  order_id: number | null;
  code: string | null | undefined;
  delivery_service_provider_id: number | null;
  delivery_service_provider_type: string | null;
  delivery_service_provider_code: string | null;
  delivery_service_provider_name: string | null;
  delivery_transport_type: string | null;
  shipper_code: string | null;
  shipper_name: string | null;
  handover_id: number | null;
  service: string | null;
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
  office_time?: boolean | null;
}

export interface OrderPaymentRequest {
  payment_method_id: number;
  payment_method: string;
  payment_method_code?: string;
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
  bank_account_id?: number;
  bank_account_number?:	string;
  bank_account_holder?:	string;

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
  code: string;
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
  product_code?: string;
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
  tax_include: boolean | null;
  composite?: boolean;
  product: string;
  is_composite?: boolean;
  line_amount_after_line_discount: number;
  discount_items: Array<OrderItemDiscountRequest>;
  discount_rate: number;
  discount_value: number;
  discount_amount: number;
  position?: number;
  gifts: Array<OrderLineItemRequest>;
  available:number|null;
  maxQuantityToApplyDiscount?: number; // số lượng tối đa để hưởng chiết khấu nếu có
}

export interface OrderItemDiscountRequest {
  rate: number;
  value: number;
  amount: number;
  promotion_id?: number;
  discount_code?: string;
  reason: string | null;
}

export interface OrderDiscountRequest {
  rate?: number | null;
  value?: number | null;
  amount?: number | null;
  promotion_id?: number | null;
  order_id?: number | null;
  reason?: string | null;
  discount_code?: string | null;
  source?: string | null;
}

export interface UpdateFulFillmentStatusRequest {
  order_id: number | null | undefined;
  fulfillment_id: number | null;
  status: string | null;
  // cancel_reason?: string | null;
  action?: string | null;
  cancel_reason_id?: string;
  sub_cancel_reason_id?: number;
  reason?: string;
  other_reason?: string;
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

export interface GHNFeeRequest {
  created_by: string | null;
  created_name: string | null;
  updated_by: string | null;
  updated_name: string | null;
  request_id: string | null;
  operator_kc_id: string | null;
  sender_country_id: number | undefined;
  sender_city_id: number | undefined;
  sender_district_id: number | undefined;
  sender_ward_id: number | undefined;
  receive_country_id: number | undefined;
  receive_city_id: number | undefined;
  receive_district_id: number | undefined;
  receive_ward_id: number | undefined;
  sender_address: string | null | undefined;
  receive_address: string | null | undefined;
  price: number | 0;
  quantity: number | 0;
  weight: number | 0;
  length: number | 0;
  height: number | 0;
  width: number | 0;
  ghn_service_id: number | 0;
  coupon: string | null;
  cod: number | 0;
}

export interface VTPFeeRequest {
  created_by: string | null;
  created_name: string | null;
  updated_by: string | null;
  updated_name: string | null;
  request_id: string | null;
  operator_kc_id: string | null;
  sender_country_id: number | undefined;
  sender_city_id: number | undefined;
  sender_district_id: number | undefined;
  sender_ward_id: number | undefined;
  receive_country_id: number | undefined;
  receive_city_id: number | undefined;
  receive_district_id: number | undefined;
  receive_ward_id: number | undefined;
  sender_address: string | null | undefined;
  receive_address: string | null | undefined;
  price: number | 0;
  quantity: number | 0;
  weight: number | 0;
  length: number | 0;
  height: number | 0;
  width: number | 0;
  ghn_service_id: number | 0;
  coupon: string | null;
  cod: number | 0;
}

export interface GetFeesRequest {
  from_city_id: number | undefined;
  from_city: string | undefined;
  from_district_id: number | undefined;
  from_district: string | undefined;
  from_ward_id: number | undefined;
  to_country_id: number | undefined;
  to_city_id: number | undefined;
  to_city: string | undefined;
  to_district_id: number | undefined;
  to_district: string | undefined;
  to_ward_id: number | undefined;
  from_address: string | undefined;
  to_address: string | undefined;
  price: number | undefined;
  quantity: number | 0;
  weight: number | 0;
  length: number | 0;
  height: number | 0;
  width: number | 0;
  service_id: number | 0;
  service: string;
  option: string;
  insurance: number | 0;
  coupon: string | null;
  cod: number | 0;
}

export interface ConfirmDraftOrderRequest {
  updated_by: string;
  updated_name: string;
}

export interface CreateShippingOrderRequest {
  order_type: string;
  shipment: {
    delivery_service_code: string | undefined;
    order_code: string | undefined;
    fulfillment_code: string | undefined;
    store_id: number | undefined;
    transport_type: string | undefined;
    cod: number | undefined;
    insurance: number | undefined;
    note_to_shipper: string | undefined;
    shipping_requirement: string | undefined;
    who_paid: string | undefined;
  };
  sender_address: {
    name: string;
    phone_number: string;
    email: string | undefined;
    address: string;
    province_id: number;
    province_name: string;
    district_id: number;
    district_name: string;
    ward_id: number;
    ward_name: string;
  };
  receiver_address: {
    name: string;
    phone_number: string;
    email: string;
    address: string;
    province_id: number;
    province_name: string;
    district_id: number;
    district_name: string;
    ward_id: number;
    ward_name: string;
  };
  products: {
    name: string;
    sku: string;
    price: number;
    quantity: number;
    weight: number;
    weight_unit: string;
  }[];
}

/**
 * tách đơn
 */
export interface SplitOrderRequest {
  order_code: string;
  quantity: number;
  updated_by: string;
  updated_name: string;
}

/**
* Tính điểm đổi trả
*/
export interface OrderReturnCalculateRefundRequestModel {
  customerId: number,
  orderId: number,
  items: OrderLineItemRequest[],
  return_items: OrderResponse[],
  refund_money: number
}