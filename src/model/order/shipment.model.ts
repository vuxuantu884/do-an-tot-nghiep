export interface Item {
  variant_id: number;
  sku: string;
  quantity: number;
  variant: string;
}

export interface Shipment {
  delivery_service_provider_id: number;
  delivery_service_provider_type: string;
  expected_received_date: string | null;
  id: number;
  sender_address: object;
  shipping_address?: {
    channel: string|null;
    city: string|null;
    country: string|null;
    district: string|null;
    email: string|null;
    full_address: string|null;
    id: number|null;
    name: string|null;
    phone: string|null;
    ward: string|null;
    zip_code: string|null;
  };
  shipping_fee_paid_to_three_pls: number;
  service: string;
  cancel_reason: string;
  cod: number;
	reference_status: string;
}
export interface ShipmentModel {
  id: number;
  code: string;
  order_id: string;
  customer: string;
  shipment: Shipment;
  account: string;
  account_code: string;
  assignee_code: string;
  delivery_type: string;
  status: string;
  stock_location_id: string | null;
  payment_status: string | null;
  total: string | null;
  total_tax: string | null;
  total_discount: string | null;
  total_quantity: number;
  items: Array<Item>;
  created_date: string | null;
  packed_on: string | null;
  shipped_on: string | null;
  export_on: string | null;
  received_on: string | null;
  cancel_date: string | null;
  receive_cancellation_on: string | null;
  status_before_cancellation: string | null;
  discount_rate: string | null;
  discount_value: string | null;
  discount_amount: string | null;
  total_line_amount_after_line_discount: string | null;
  finished_order_on: string | null;
	reason?: {
		id: number;
		name: string;
	}
}

export interface ShipmentSearchQuery {
  page: number;
  limit: number;
  sort_type: string | null;
  sort_column: string | null;
  search_term: string | null;
  status: string | null;
  stock_location_ids: [];
  shipper_ids?: [];
  shipper_codes?: [];
  delivery_provider_ids: [];
  delivery_types: [];
  reference_status: [];

  packed_on_min: string | null;
  packed_on_max: string | null;
  packed_on_predefined: string | null;
  exported_on_min: string | null;
  exported_on_max: string | null;
  exported_on_predefined: string | null;
  ship_on_min: string | null;
  ship_on_max: string | null;
  ship_on_predefined: string | null;
  received_on_min: string | null;
  received_on_max: string | null;
  received_predefined: string | null;
  cancelled_on_min: string | null;
  cancelled_on_max: string | null;
  cancelled_on_predefined: string | null;
  print_status: string[];
  pushing_status?: string[];
  store_ids: [];
  source_ids: [];
  account_codes: [];
  shipping_address: string | null;
  variant_ids: [];
  note: string | null;
  customer_note: string | null;
  tags: [];
  cancel_reason: [];
}

export interface thirdPLModel {
  delivery_service_provider_code: string | null;
  delivery_service_provider_id: number | null;
  insurance_fee: number | null;
  delivery_service_provider_name: string | null;
  delivery_transport_type: string | null;
  service: string | null;
  shipping_fee_paid_to_three_pls: number | null;
}
