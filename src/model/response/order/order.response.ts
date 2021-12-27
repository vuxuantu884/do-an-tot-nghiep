import {BaseObject} from "model/base/base.response";
import {StoreResponse} from "model/core/store.model";

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
  source_code: string | null;
  note: string | null;
  tags: string | null;
  customer_note: string | null;
  sale_note: string | null;
  account_code: string | null;
  account: string | null;
  assignee_code: string | null;
  assignee: string | null;
  marketer_code: string | null;
  marketer: string | null;
  coordinator_code: string | null;
  coordinator: string | null;
  channel_id: number | null;
  channel: string | null;
  customer_id: number | null;
  customer: string | null;
  customer_phone_number: string | null;
  customer_email: string | null;
  customer_address: string | null;
  customer_ward: string | null;
  customer_district: string | null;
  customer_city: string | null;
  fulfillment_status: string | null;
  packed_status: string | null;
  received_status: string | null;
  payment_status: string | null;
  return_status: string | null;
  reference: string | null;
  reference_code: string | null;
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
  sub_status?: string;
  sub_status_id?: number | null;
  sub_status_code?: string;
  reason_name?: string;
  sub_reason_name?: string;
  return_date?: string;
  receive_date?: string;
  order_code?: string;
  order_id?: number;
  order_returns?: Array<OrderResponse>;
  order_return_origin?: OrderReturnModel;
  point_refund?: number;
  money_refund?: number;
  shipment: ShipmentResponse | null | undefined;
  linked_order_code: string | null;
  ecommerce_shop_name: string | null;
	automatic_discount?: boolean;
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
  product_code?: string;
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
  line_amount_after_line_discount: number;
  discount_items: Array<OrderItemDiscountResponse>;
  discount_rate: number;
  discount_value: number;
  discount_amount: number;
  position?: number;
  gifts: Array<OrderLineItemResponse>;
  available:number|null;
}

export interface ReturnProductModel extends OrderLineItemResponse {
  maxQuantityCanBeReturned: number;
}

export interface FulFillmentResponse {
  id: number;
  code: string | null;
  store_id: number | null;
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
  total_line_amount_after_line_discount: number;
  shipment: ShipmentResponse | null | undefined;
  billing_address: BillingAddress | null;
  items: Array<OrderLineItemResponse>;
  payments: Array<OrderPaymentResponse>;
  created_date: string | null;
  cancel_date: string | null;
  return_status: string | null;
}

export interface OrderDiscountResponse {
  rate: number | null;
  value: number | null;
  amount: number | null;
  promotion_id: number | null;
  reason: string | null;
  source: string | null;
  discount_code: string | null;
}

// export interface OrderItemDiscountResponse {
//   rate: number | null;
//   value: number;
//   amount: number | null;
//   promotion_id?: number | null;
//   reason: string | null;
// }

export interface OrderItemDiscountResponse {
  rate: number;
  value: number;
  amount: number;
  promotion_id?: number;
  reason: string | null;
}

export interface OrderPaymentResponse extends BaseObject {
  payment_method_id: number;
  payment_method: string;
  payment_method_code: string;
  amount: number;
  reference: string;
  source: string;
  paid_amount: number;
  return_amount: number;
  status: string;
  name?: string;
  point?: number;
  customer_id: number;
  type: string;
  note: string;
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
  delivery_service_provider_code: string | null;
  delivery_service_provider_id: number | null;
  delivery_service_provider_name: string | null;
  delivery_service_provider_type: string | null;
  delivery_transport_type: string | null;
  insurance_fee: number | null;
  shipper_code: string | null;
  shipper_name: string | null;
  handover_id: number | null;
  service: string | null;
  who_paid: string | null;
  fee_type: string | null;
  fee_base_on: string | null;
  delivery_fee: number | null;
  shipping_fee_informed_to_customer: number | null;
  shipping_fee_paid_to_three_pls: number | null;
  expected_received_date: string | null;
  reference_status: string | null;
  reference_status_explanation: string | null;
  cancel_reason: string | null;
  tracking_code: string | null;
  tracking_url: string | null;
  pushing_status: string | null;
  pushing_note: string | null;
  received_date: string | null;
  sender_address_id: number | null;
  sender_address?: StoreResponse;
  note_to_shipper: string | null;
  requirements: string | null;
  requirements_name: string | null;
  shipping_address: ShippingAddress | null;
  fulfillment_id: string | null;
  cod: number;
  office_time: string | null;
  info_shipper: string | null;
}

export interface DeliveryServiceResponse {
  id: number;
  code: string;
  active: boolean;
  external_service_code: string;
  name: string;
  logo: string;
  config: {
    id: number;
    external_service_id: number;
    external_service_code: string;
    base_url: string;
    status: string;
  } | null;
  transport_types: {
    id: number;
    external_service_id: number;
    external_service_code: string;
    name: string;
    status: string;
  }[];
}

export type DeliveryServiceTransportType = {
  code: string;
  name: string;
  description: string;
  active: boolean;
};

export type DeliveryTransportTypesResponse = {
  code: string;
  name: string;
  description: string;
  active: boolean;
};

export type DeliveryMappedStoreType = {
  store_id: number;
  name: string;
  partner_shop_id: number;
};

export interface ShippingGHTKResponse {
  name: string;
  fee: number;
  insurance_fee: number;
  delivery_type: string;
}

export interface GHNFeeResponse {
  coupon_value: number;
  insurance_fee: number;
  pick_station_fee: number;
  r2s_fee: number;
  service_fee: number;
  total: number;
}

export interface VTPFeeResponse {
  GIA_CUOC: number;
  MA_DV_CHINH: string;
  TEN_DICHVU: string;
  THOI_GIAN: string;
}

export interface FeesResponse {
  delivery_service_code: string;
  total_fee: number;
  insurance_fee: number;
  transport_type: string;
  transport_type_name: string;
  note: string;
  delivery: boolean;
}

export interface StoreCustomResponse extends BaseObject {
  name: string;
  rank: number;
  rank_name: string;
  square: number;
  country_id: number;
  country_name: string;
  city_id: number;
  city_name: string;
  department: string;
  department_id: number,
  status: string;
  status_name: string;
  zip_code: string;
  district_id: number;
  district_name: string;
  ward_id: number;
  ward_name: string;
  address: string;
  hotline: string;
  vm:string;
  vm_code: string;
  mail: string;
  begin_date: string;
  number_of_account: number;
  accounts: Array<any>;
  is_saleable: boolean;
  is_stocktaking: boolean;
  type: string;
  type_name: string;
}

export interface OrderSubStatusResponse {
  // id: 6;
  id: number;
  company_id: number;
  company: string;
  sub_status: string;
  code: string;
  status: string;
  note: string;
  is_active: boolean;
  is_delete?: boolean;
}

export interface TrackingLogFulfillmentResponse extends BaseObject {
  fulfillment_code: string;
  shipment_id: string;
  tracking_code: string;
  response_code: string;
  message: string;
  raw_data: string;
  action_date: string;
  deleted: boolean;
  shipping_status: string|null;
  status: string;
  partner_note: string|null;
}

export interface ErrorLogResponse extends BaseObject {
  fulfillment_code: string;
  shipment_id: string;
  tracking_code: string;
  response_body: string;
  action: string;
  request_body: string;
  deleted: boolean;
}

export interface OrderReturnModel extends OrderResponse {
  received: boolean;
  total_amount: number;
}

export interface OrderReturnReasonModel {
  id: number;
  name: string;
  sub_reasons: {
    id: number;
    name: string;
  }[]
}

export interface OrderConfig extends BaseObject {
  sellable_inventory: boolean;
}

export interface OrderProductListModel extends OrderLineItemResponse {
  pick: number;
  color: string;
}

export interface ChannelTypeResponse{
  id:number;
  code:string;
  name:string
}

export interface ChannelsResponse extends BaseObject{
  name:string;
  channel_type:ChannelTypeResponse;
}
