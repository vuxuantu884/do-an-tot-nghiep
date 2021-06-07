export interface SizeCreateRequest {
  category_ids: Array<number>
  code: string,
}

export interface SizeUpdateRequest extends SizeCreateRequest  {
  version: number,
}