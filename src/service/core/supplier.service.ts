import BaseAxios from "base/BaseAxios"
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig"
import { SearchSupplierQuerry } from "model/query/supplier.query";
import { PageResponse } from "model/response/base-metadata.response";
import { SupplierResposne } from "model/response/supplier/supplier.response";
import { CreateSupplierRequest, UpdateSupplierRequest } from "model/request/create-supplier.request";
import { generateQuery } from "utils/AppUtils";

export const getSupplierAPI = (query: SearchSupplierQuerry): Promise<BaseResponse<PageResponse<SupplierResposne>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.CORE}/suppliers?${params}`)
}

export const deleteSupplierAPI = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.delete(`${ApiConfig.CORE}/suppliers/${id}`)
}

export const detailSupplierAPI = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.get(`${ApiConfig.CORE}/suppliers/${id}`)
}

export const putSupplierAPI = (id: number, request: UpdateSupplierRequest): Promise<BaseResponse<SupplierResposne>> => {
  return BaseAxios.put(`${ApiConfig.CORE}/suppliers/${id}`, request)
}

export const createSupplierAPI = (request: CreateSupplierRequest): Promise<BaseResponse<SupplierResposne>> => {
  return BaseAxios.post(`${ApiConfig.CORE}/suppliers`, request)
}
