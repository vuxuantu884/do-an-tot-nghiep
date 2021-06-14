export interface BaseMetadata {
  total: number,
  limit: number,
  page: number,
}

export interface PageResponse<T> {
  metadata: BaseMetadata,
  items: Array<T>,
}