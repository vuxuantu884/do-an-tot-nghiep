export interface HandoverOrderRequest {
  id: number | null;
  handover_id: number | null;
  fulfillment_code: string;
}

export interface HandoverRequest {
  type: string | null;
  delivery_service_provider_id: number | null;
  channel_id: number | null;
  note: string | null;
  store_id: number | null;
  orders: Array<HandoverOrderRequest>;
}

export interface HandoverNoteRequest {
  note: string;
}