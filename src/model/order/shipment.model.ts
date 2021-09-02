export interface Item {
  variant_id: number;
  sku: string;
  quantity: number;
  variant: string;
}

export interface Shipment {
  id: number;
  shipment: {
    delivery_service_provider_id: number;
    delivery_service_provider_name: string|null;
    delivery_service_provider_type: string;
    id: number
  };
  
  status: string;
}
export interface ShipmentModel {
  id: number;
  order_id: string;
  customer: string;
  shipment: ShipmentModel;
  assignee_code: string;
  delivery_type: string;
  status: string;
  stock_location_id: string|null;
  payment_status: string|null;
  total: string|null;
  total_tax: string|null;
  total_discount: string|null;
  total_quantity: number;
  items: Array<Item>;
  
  packed_on: string|null;
  shipped_on: string|null;
  export_on: string|null;
  received_on: string|null;
  cancel_date: string|null;
  receive_cancellation_on: string|null;
  status_before_cancellation: string|null;
  discount_rate: string|null;
  discount_value: string|null;
  discount_amount: string|null;
  total_line_amount_after_line_discount: string|null;
}

export interface ShipmentSearchQuery {
  page: number;
  limit: number;
  sort_type: string|null;
  sort_column: string|null;
  search_term: string|null;
  status: [];
  stock_location_ids: [];
  delivery_service_provider_ids: [];
  delivery_service_provider_types: [];
  reference_status: [];

  packed_on_min: string|null;
  packed_on_max: string|null;
  packed_on_predefined: string|null;
  exported_on_min: string|null;
  exported_on_max: string|null;
  exported_on_predefined: string|null;
  ship_on_min: string|null;
  ship_on_max: string|null;
  ship_on_predefined: string|null;
  received_on_min: string|null;
  received_on_max: string|null;
  received_predefined: string|null;
  cancelled_on_min: string|null;
  cancelled_on_max: string|null;
  cancelled_on_predefined: string|null;
  print_status: [];
  sources: [];
  assignees: [];
  shipping_address: string|null;
  variant_ids: [];
  note: string|null;
  customer_note: string|null;
  tags: [];
  cancel_reason: [];
}
