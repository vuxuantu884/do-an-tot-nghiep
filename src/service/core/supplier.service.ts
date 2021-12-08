import BaseAxios from "base/base-supplier.axios"
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config"
import { SupplierQuery, SupplierUpdateRequest, SupplierCreateRequest, SupplierResponse, SupplierAddress, SupplierContact, SupplierPayment } from "model/core/supplier.model";
import { PageResponse } from "model/base/base-metadata.response";
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

export const supplierCreateAddressApi = (id: number, request: SupplierAddress): Promise<BaseResponse<SupplierResponse>> => {
  return BaseAxios.post(`${ApiConfig.CORE}/suppliers/${id}/addresses`, request)
}

export const supplierUpdateAddressApi = (id: number, addressId: number, request: SupplierAddress): Promise<BaseResponse<SupplierResponse>> => {
  return BaseAxios.put(`${ApiConfig.CORE}/suppliers/${id}/addresses/${addressId}`, request)
}

export const supplierDeleteAddressApi = (id: number, addressId: number): Promise<BaseResponse<SupplierResponse>> => {
  return BaseAxios.delete(`${ApiConfig.CORE}/suppliers/${id}/addresses/${addressId}`)
}

export const supplierCreateContactApi = (id: number, request: SupplierContact): Promise<BaseResponse<SupplierResponse>> => {
  return BaseAxios.post(`${ApiConfig.CORE}/suppliers/${id}/contacts`, request)
}

export const supplierUpdateContactApi = (id: number, addressId: number, request: SupplierContact): Promise<BaseResponse<SupplierResponse>> => {
  return BaseAxios.put(`${ApiConfig.CORE}/suppliers/${id}/contacts/${addressId}`, request)
}

export const supplierDeleteContactApi = (id: number, addressId: number): Promise<BaseResponse<SupplierResponse>> => {
  return BaseAxios.delete(`${ApiConfig.CORE}/suppliers/${id}/contacts/${addressId}`)
}

export const supplierCreatePaymentApi = (id: number, request: SupplierPayment): Promise<BaseResponse<SupplierResponse>> => {
  return BaseAxios.post(`${ApiConfig.CORE}/suppliers/${id}/payments`, request)
}

export const supplierUpdatePaymentApi = (id: number, paymentId: number, request: SupplierPayment): Promise<BaseResponse<SupplierResponse>> => {
  return BaseAxios.put(`${ApiConfig.CORE}/suppliers/${id}/payments/${paymentId}`, request)
}

export const supplierDeletePaymentApi = (id: number, paymentId: number): Promise<BaseResponse<SupplierResponse>> => {
  return BaseAxios.delete(`${ApiConfig.CORE}/suppliers/${id}/payments/${paymentId}`)
}
