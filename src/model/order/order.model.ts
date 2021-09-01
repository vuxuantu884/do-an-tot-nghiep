export interface OrderItemModel {
  variant_id: number;
  quantity: number;
  sku: string;
}
export interface OrderPaymentModel {
  id: number;
  payment_method_id: number;
  payment_method: string;
  amount: number;
  source: string|null;
  paid_amount: number;
  return_amount: number;
  status: string;
  type: string;
  total: number|0;
}

export interface OrderFulfillmentsModel {
  id: number;
  shipment: {
    delivery_service_provider_id: number;
    delivery_service_provider_name: string|null;
    delivery_service_provider_type: string;
    id: number
  };
  
  status: string;
}
export interface OrderModel {
  id: number;
  code: string;
  customer: string;
  customer_phone_number: string;
  store_full_address: string;
  store: string;
  source: string;
  status: string;
  sub_status: string|null;
  fulfillment_status: string|null;
  packed_status: string|null;
  received_status: string|null;
  payment_status: string|null;
  return_status: string|null;
  total_line_amount_after_line_discount: number;
  items: Array<{
    id: number;
    sku: string;
  }>;
  pre_payments: string;
  payments: Array<OrderPaymentModel>;
  fulfillments: Array<OrderFulfillmentsModel>;
  account_code: string|null;
  account: string|null;
  assignee_code: string|null;
  assignee: string|null;
  finalized_on: string|null;
  cancelled_on: string|null;
  finished_on: string|null;
  created_date: string|null;
  note: string|null;
  customer_note: string|null;
  tags: string|null;
  reference_code: string|null;
}

export interface OrderSearchQuery {
  page: number;
  limit: number;
  sort_type: string|null;
  sort_column: string|null;
  code: string|null;
  store_ids: [];
  source_ids: [];
  issued_on_min: string|null;
  issued_on_max: string|null;
  issued_on_predefined: string|null;
  finalized_on_min: string|null;
  finalized_on_max: string|null;
  finalized_on_predefined: string|null;
  ship_on_min: string|null;
  ship_on_max: string|null;
  ship_on_predefined: string|null;
  expected_receive_on_min: string|null;
  expected_receive_on_max: string|null;
  expected_receive_predefined: string|null;
  completed_on_min: string|null;
  completed_on_max: string|null;
  completed_on_predefined: string|null;
  cancelled_on_min: string|null;
  cancelled_on_max: string|null;
  cancelled_on_predefined: string|null;
  order_status: [];
  order_sub_status: [],
  fulfillment_status: [];
  payment_status: [];
  return_status: [];
  account?: [];
  assignee?: [];
  price_min: number|undefined;
  price_max: number|undefined;
  payment_method_ids: [];
  ship_by: string|null;
  note: string|null;
  customer_note: string|null;
  tags: [];
  reference_code: string|null
}
