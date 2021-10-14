export interface PackSearchQuery {
  page: number;
  limit: number;
  sort_type: string|null;
  sort_column: string|null;
  delivery_provider_ids: [];
//   type_report
}