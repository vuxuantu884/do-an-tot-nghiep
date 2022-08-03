export interface HandoverSearchRequest {
  query?: string | null;
  ids?: Array<number> | null;
  store_ids?: Array<number> | null;
  delivery_service_provider_ids?: Array<number> | null;
  types?: Array<string> | null;
  channel_ids?: Array<number> | null;
  from_created_date?: null|string,
  to_created_date?: null|string,
  page?: number;
  limit?: number;
}