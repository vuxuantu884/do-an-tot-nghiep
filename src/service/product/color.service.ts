import { ColorSearchQuery } from 'model/query/color.search.query';

import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { PageResponse } from "model/response/base-metadata.response";
import { generateQuery } from "utils/AppUtils";
import { ColorResponse } from "model/response/products/color.response";
import { ColorCreateRequest } from 'model/request/color-create.request';

export const colorSearchApi = (query: ColorSearchQuery): Promise<BaseResponse<PageResponse<ColorResponse>>> => {
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

export const colorUpdateApi = (id: number, request: ColorCreateRequest): Promise<BaseResponse<ColorResponse>> => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/colors/${id}`, request);
}

export const colorDetailApi = (id: number): Promise<BaseResponse<ColorResponse>> => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/colors/${id}`);
}
