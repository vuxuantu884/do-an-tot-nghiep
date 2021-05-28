export interface CreateMaterialRequest {
  code: string,
  component: string,
  description: string,
  name: string,
}

export interface UpdateMaterialRequest extends CreateMaterialRequest {
  version: number,
}