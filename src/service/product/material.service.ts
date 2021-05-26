import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { PageResponse } from "model/response/base-metadata.response";
import { MaterialResponse } from "model/response/product/material.response";

export const getMaterialApi = (
  component: string|null, 
  created_name: string|null, 
  description: string|null, 
  info: string|null, 
  limit: number, 
  page: number,
  sortColumn: string|null, 
  sortType: string|null): Promise<BaseResponse<PageResponse<MaterialResponse>>> => {
  let params = `?limit=${limit}&page=${page}`;
  if(component !== null) {
    params = params + `&component=${component}`;
  }
  if(created_name !== null) {
    params = params + `&created_name=${created_name}`;
  }
  if(description !== null) {
    params = params + `&description=${description}`;
  }
  if(info !== null) {
    params = params + `&info=${info}`;
  }
  if(sortColumn !== null) {
    params = params + `&sort_column=${sortColumn}`;
  }
  if(sortType !== null) {
    params = params + `&sort_type=${sortType}`;
  }
  return BaseAxios.get(`${ApiConfig.PRODUCT}/materials${params}`);
}