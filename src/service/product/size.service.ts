import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { PageResponse } from "model/base/base-metadata.response";
import { SizeCreateRequest, SizeQuery, SizeResponse, SizeUpdateRequest } from "model/product/size.model";
import { generateQuery } from "utils/AppUtils";

export const getAllSizeApi = (): Promise<BaseResponse<PageResponse<SizeResponse>>> => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/sizes`);
};

export const getSearchSize = (query?: SizeQuery): Promise<BaseResponse<PageResponse<SizeResponse>>> => {
  
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/sizes?${params}`);
};

export const sizeCreateApi = (request: SizeCreateRequest): Promise<BaseResponse<SizeResponse>> => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/sizes`, request)
}

export const sizeDetailApi = (id: number): Promise<BaseResponse<SizeResponse>> => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/sizes/${id}`)
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