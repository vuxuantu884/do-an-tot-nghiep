import { BaseObject } from "model/base/base.response";
import { BillingAddress, FulFillmentResponse, OrderDiscountResponse, OrderLineItemResponse, OrderPaymentResponse, OrderResponse, OrderReturnModel, ShipmentResponse, ShippingAddress, TrackingLogFulfillmentResponse } from "model/response/order/order.response";

export interface OrderItemModel {
  product_id: number;
  variant_id: number;
  quantity: number;
  sku: string;
  variant: string;
}
export interface OrderPaymentModel {
  id: number;
  payment_method_id: number;
  payment_method: string;
  amount: number;
  source: string | null;
  paid_amount: number;
  return_amount: number;
  status: string;
  type: string;
  total: number | 0;
}

export interface OrderFulfillmentsModel {
  id: number;
  shipment: {
    delivery_service_provider_id: number;
    delivery_service_provider_name: string | null;
    delivery_service_provider_type: string;
    id: number;
  };

  status: string;
}
export interface OrderModel extends BaseObject {
  ecommerce_shop_id: null;
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
  payments: Array<OrderPaymentResponse>;
  total_paid?: number | null;
  shipping_address: ShippingAddress | null;
  billing_address: BillingAddress | null;
  fulfillments: Array<FulFillmentResponse> | null | undefined;
  sub_status?: string;
  sub_status_id?: number | null;
  sub_status_code?: string;
  reason_name?: string;
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
  total_weight: number | null;
  channel_code: string;
  created_on?: string | null;
  total_quantity: number;
  goods_receipt_id: number;
  export_bill: boolean;
}

export interface OrderSearchQuery {
  page: number | null;
  limit: number | null;
  is_online?: string | null;
  is_split?: boolean;
  sort_type: string | null;
  sort_column: string | null;
  code: string | null;
  store_ids: Array<any>;
  source_ids: Array<any> | [];
  variant_ids: [];
  customer_ids: Array<number>;
  issued_on_min: string | null;
  issued_on_max: string | null;
  issued_on_predefined: string | null;
  finalized_on_min: string | null;
  finalized_on_max: string | null;
  finalized_on_predefined: string | null;
  ship_on_min: string | null;
  ship_on_max: string | null;
  ship_on_predefined: string | null;
  expected_receive_on_min: string | null;
  expected_receive_on_max: string | null;
  expected_receive_predefined: string | null;
  exported_on_min?: string | null;
  exported_on_max?: string | null;
  exported_on_predefined?: string | null;
  completed_on_min: string | null;
  completed_on_max: string | null;
  completed_on_predefined: string | null;
  cancelled_on_min: string | null;
  cancelled_on_max: string | null;
  cancelled_on_predefined: string | null;
  order_status: [];
  sub_status_code?: [];
  fulfillment_status: [];
  payment_status: [];
  return_status: [];
  account_codes?: [];
  created_by?: [];
  assignee_codes?: [];
  coordinator_codes?: [];
  marketer_codes?: [];
  price_min: number | undefined;
  price_max: number | undefined;
  payment_method_ids: [];
  delivery_types: [];
  delivery_provider_ids: [];
  shipper_ids?: [];
  shipper_codes?: [];
  note: string | null;
  customer_note: string | null;
  tags: [];
  marketing_campaign?: [];
  reference_code: string | null;
  search_term?: string | null;
	services?: [];
  channel_codes?: Array<any> | [];
  tracking_codes ?: Array<string> | [];
}

export interface OrderSearchQueryModel {
  page: number;
  limit: number;
  is_online?: string | null;
  is_split?: string | null;
  sort_type: string | null;
  sort_column: string | null;
  code: string | null;
  store_ids: [];
  source_ids: Array<any> | [];
  variant_ids: [];
  customer_ids: Array<number>;
  issued_on_min: string | null;
  issued_on_max: string | null;
  issued_on_predefined: string | null;
  finalized_on_min: string | null;
  finalized_on_max: string | null;
  finalized_on_predefined: string | null;
  ship_on_min: string | null;
  ship_on_max: string | null;
  ship_on_predefined: string | null;
  expected_receive_on_min: string | null;
  expected_receive_on_max: string | null;
  expected_receive_predefined: string | null;
  completed_on_min: string | null;
  completed_on_max: string | null;
  completed_on_predefined: string | null;
  cancelled_on_min: string | null;
  cancelled_on_max: string | null;
  cancelled_on_predefined: string | null;
  order_status: [];
  sub_status_code?: [];
  fulfillment_status: [];
  payment_status: [];
  return_status: [];
  account_codes?: [];
  assignee_codes?: [];
  price_min: number | undefined;
  price_max: number | undefined;
  payment_method_ids: [];
  delivery_types: [];
  delivery_provider_ids: [];
  shipper_ids?: [];
  shipper_codes?: [];
  note: string | null;
  customer_note: string | null;
  tags: [];
  reference_code: string | null;
  search_term?: string | null;
}

export interface EcommerceOrderSearchQuery extends OrderSearchQuery {
  ecommerce_shop_ids: any[];
  channel_id: number | undefined;
}

export interface DuplicateOrderSearchQuery {
  page: number|null;
  limit: number|null;
  issued_on_min:string|null;
  issued_on_max:string|null;
  search_term:string|null;
  store_id?:number|null
}

export interface DuplicateOrderDetailQuery extends OrderSearchQuery{
  full_address:string,
  ward:string,
  district:string,
  city:string,
  country:string
}

export interface StoreBankAccountNumbersQueryModel  {
  store_ids: number[];
}

export interface StoreBankAccountNumberModel {
  account_holder: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
  default: boolean;
  status: boolean;
  id: number;
}

export interface DuplicateOrderDetailQuery extends OrderSearchQuery{
  full_address:string,
  ward:string,
  district:string,
  city:string,
  country:string
}

export interface OrderExtraModel extends OrderModel {
  trackingLog?: Array<TrackingLogFulfillmentResponse> | null;
  isShowTrackingLog?: boolean;
  statuses?: {
    name?: string;
    code?: string;
  }[];
  subStatus?: string;
}

export interface FulfillmentsOrderPackQuery{
  code:string;
  store_id?:number;
  delivery_service_provider_id?:number;
  // channel_id?:number;
  // receipt_type_id?:number;
}

export type OrderSourceTypeModel = "offline" | "online" | null ;

export type ChangeOrderStatusHtmlModel = {
  id: number;
  isSuccess: boolean;
  text: string;
}