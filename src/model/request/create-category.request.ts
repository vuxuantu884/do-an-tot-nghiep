export interface CreateCatergoryRequest {
  code: string,
  name: string,
  goods: string,
  parent_id: number|null,
}

export interface UpdateCatergoryRequest extends CreateCatergoryRequest {
 version: number
}