export interface OrderSubDto {
  id: number;
  code: string;
  reference_code: string;
  channel_id: number;
  channel_code: string;
  channel: string;
}

export interface ShippmentDto {
  id: number;
  delivery_service_provider_id: number | null;
  delivery_service_provider_code: string | null;
  delivery_service_provider_name: string | null;
  delivery_transport_type: string | null;
  delivery_service_provider_type: string | null;
  handover_id: string | null;
  service: string | null;
  who_paid: string | null;
  fee_type: string | null;
  fee_base_on: string | null;
  delivery_fee: string | null;
  reference_status: string | null;
  reference_status_explanation: string | null;
  cancel_reason: string | null;
  requirements: string | null;
  requirements_name: string | null;
  note_to_shipper: string | null;
  cod: number | null;
  shipper_name: string | null;
  shipper_phone: string | null;
  pushing_status: string | null;
  shipping_fee_informed_to_customer: number | null;
}

export interface FulfillmentLineItemDto {
  code: string;
  discount_amount: number | null;
  discount_items: number | null;
  import_price: number | null;
  price: number;
  product: string;
  product_code: string;
  product_id: number;
  quantity: number;
  sku: string;
  type: string;
  unit: string;
  variant: string;
  variant_barcode: string;
  variant_id: number;
  weight: number;
}

export interface FulfillmentDto {
  id: number;
  key: number;
  order_id: number;
  code: string;
  order: OrderSubDto;
  shipment: ShippmentDto;
  items: Array<FulfillmentLineItemDto>;
  status: string;
  account_code: string | null;
  assignee_code: string | null;
  order_code: string;
  cancel_date: Date | null;
  created_date: Date | null;
  delivery_type: string | null;
  discount_amount: number | null;
  discount_rate: number | null;
  discount_value: number | null;
  export_on: Date | null;
  packed_on: Date | null;
  payment_status: string;
  picked_on: Date | null;
  receive_cancellation_on: Date | null;
  received_on: Date | null;
  return_status: string | null;
  shipped_on: Date | null;
  status_before_cancellation: string | null;
  stock_location_id: number | null;
  total: number;
  total_discount: number;
  total_line_amount_after_line_discount: number;
  total_quantity: number;
  total_tax: number | null;
}
