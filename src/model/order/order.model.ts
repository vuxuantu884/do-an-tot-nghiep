export interface OrderItemModel {
  variant_id: number;
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
  sort_type: string;
  sort_column: string;
  code: string;
  customer: string;
  store_address: string;
  source: string;
  issued_on_min: string;
  issued_on_max: string;
  issued_on_predefined: string;
  finalized_on_min: string;
  finalized_on_max: string;
  finalized_on_predefined: string;
  ship_on_min: string;
  ship_on_max: string;
  ship_on_predefined: string;
  completed_on_min: string;
  completed_on_max: string;
  completed_on_predefined: string;
  cancelled_on_min: string;
  cancelled_on_max: string;
  cancelled_on_predefined: string;
  order_status: [
    string
  ];
  fulfillment_status: [
    string
  ];
  payment_status: [
    string
  ];
  return_status: [
    string
  ];
  account: string;
  assignee: string;
  price_min: number;
  price_max: number;
  payment_method_ids: [
    number
  ];
  ship_by: string;
  note: string;
  customer_note: string;
  tags: string;
  reference_code: string
}
