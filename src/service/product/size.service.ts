import { SizeResponse } from "./../../model/response/products/size.response";
import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { PageResponse } from "model/response/base-metadata.response";
import { SizeCreateRequest, SizeUpdateRequest } from "model/request/size.request";

export const getAllSizeApi = (): Promise<BaseResponse<PageResponse<SizeResponse>>> => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/sizes`);
};

export const sizeCreateApi = (request: SizeCreateRequest): Promise<BaseResponse<SizeResponse>> => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/sizes`, request)
}

export const sizeDetailApi = (id: number): Promise<BaseResponse<SizeResponse>> => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/sizes/${id}`)
}

export const sizeUpdateApi = (id: number, request: SizeUpdateRequest): Promise<BaseResponse<SizeResponse>> => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/sizes/${id}`, request)
}

export const sizeDeleteOneApi = (id: number): Promise<BaseResponse<SizeResponse>> => {
  return BaseAxios.delete(`${ApiConfig.PRODUCT}/sizes/${id}`)
}

export const sizeDeleteManyApi = (ids: Array<number>): Promise<BaseResponse<SizeResponse>> => {
  let idsParam =  ids.join(','); 
  return BaseAxios.delete(`${ApiConfig.PRODUCT}/sizes?ids=${idsParam}`)
}