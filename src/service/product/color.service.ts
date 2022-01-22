import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { PageResponse } from "model/base/base-metadata.response";
import { generateQuery } from "utils/AppUtils";
import {ColorResponse, ColorCreateRequest, ColorSearchQuery, ColorUpdateRequest} from "model/product/color.model";

export const colorSearchApi = (query?: ColorSearchQuery): Promise<BaseResponse<PageResponse<ColorResponse>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/colors?${queryString}`);
}

export const colorDeleteOneApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.delete(`${ApiConfig.PRODUCT}/colors/${id}`);
}

export const colorDeleteManyApi = (ids: Array<number>): Promise<BaseResponse<string>> => {
  let idsParam =  ids.join(',');
  return BaseAxios.delete(`${ApiConfig.PRODUCT}/colors?ids=${idsParam}`);
}

export const colorCreateApi = (request: ColorCreateRequest): Promise<BaseResponse<ColorResponse>> => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/colors`, request);
}

export const colorUpdateApi = (id: number, request: ColorUpdateRequest): Promise<BaseResponse<ColorResponse>> => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/colors/${id}`, request);
}

export const colorDetailApi = (id: number): Promise<BaseResponse<ColorResponse>> => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/colors/${id}`);
}
