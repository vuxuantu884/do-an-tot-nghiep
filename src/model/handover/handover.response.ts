export interface HadoverOrderSubDto {
  id: number;
  code: string;
  fulfillment_code: string;
  fulfillment_id: number;
  fulfillment_status: string;
  handover_id: number;
  order_id: number;
  quantity: number;
}

export interface HandoverResponse {
  id: number;
  code: string;
  created_by: string;
  created_name: string;
  created_date: Date,
  updated_by: string;
  updated_name: string;
  updated_date: Date;
  delivery_service_provider: string;
  delivery_service_provider_id: number;
  edit: string;
  not_received: number;
  note: string;
  quantity: number;
  returning: number;
  shipped: number;
  shipping: number;
  store: string;
  store_id: number;
  channel: string;
  channel_id: number;
  total: string;
  type: string;
  orders: Array<HadoverOrderSubDto>;
  version: string;
}