import BaseAxios from "base/BaseAxios"
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig"
import { PageResponse } from "model/response/base-metadata.response";
import { generateQuery } from "utils/AppUtils";
import { StoreQuery } from "model/core/query/store.query";
import { StoreRankResponse } from "model/core/response/store-rank.response";
import { StoreResponse } from "model/core/response/store.response";
import {StoreCreateRequest, StoreUpdateRequest } from "model/core/request/store.request";

export const storeGetApi = (query?: StoreQuery): Promise<BaseResponse<PageResponse<StoreResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.CORE}/stores?${params}`)
}

export const storeRankGetApi = (): Promise<BaseResponse<Array<StoreRankResponse>>> => {
  return BaseAxios.get(`${ApiConfig.CORE}/ranks`)
}

export const storeDeleteApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.delete(`${ApiConfig.CORE}/stores/${id}`)
}

export const storesDetailApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.get(`${ApiConfig.CORE}/stores/${id}`)
}

export const storesPutApi = (id: number, request: StoreUpdateRequest): Promise<BaseResponse<StoreResponse>> => {
  return BaseAxios.put(`${ApiConfig.CORE}/stores/${id}`, request)
}

export const storesPostApi = (request: StoreCreateRequest): Promise<BaseResponse<StoreResponse>> => {
  return BaseAxios.post(`${ApiConfig.CORE}/stores`, request)
}
