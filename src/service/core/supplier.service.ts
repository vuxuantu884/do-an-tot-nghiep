import BaseAxios from "base/BaseAxios"
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig"
import { SupplierQuery } from "model/query/supplier.query";
import { PageResponse } from "model/base/base-metadata.response";
import { SupplierResponse } from "model/response/supplier/supplier.response";
import { SupplierUpdateRequest, SupplierCreateRequest } from "model/request/create-supplier.request";
import { generateQuery } from "utils/AppUtils";

export const supplierGetApi = (query?: SupplierQuery): Promise<BaseResponse<PageResponse<SupplierResponse>>> => {
 
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.CORE}/suppliers?${params}`)
}

export const supplierDeleteApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.delete(`${ApiConfig.CORE}/suppliers/${id}`)
}

export const supplierDetailApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.get(`${ApiConfig.CORE}/suppliers/${id}`)
}

export const supplierPutApi = (id: number, request: SupplierUpdateRequest): Promise<BaseResponse<SupplierResponse>> => {
  return BaseAxios.put(`${ApiConfig.CORE}/suppliers/${id}`, request)
}

export const supplierPostApi = (request: SupplierCreateRequest): Promise<BaseResponse<SupplierResponse>> => {
  return BaseAxios.post(`${ApiConfig.CORE}/suppliers`, request)
}
