import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { PageResponse } from "model/base/base-metadata.response";
import { generateQuery } from "utils/AppUtils";
import { PlaceDetailQuery, PlaceQuery, StoreQuery, StoreTypeRequest } from "model/core/store.model";
import { StoreRankResponse } from "model/core/store-rank.model";
import { StoreResponse } from "model/core/store.model";
import { StoreCreateRequest, StoreUpdateRequest } from "model/core/store.model";
import { StoreCustomResponse } from "model/response/order/order.response";

export const getPlaceApi = (params: PlaceQuery): Promise<any> => {
  let url = `${ApiConfig.CORE}/stores/google/place?key=${params.key}&query=${params.query}`
  return BaseAxios.get(url);
}

export const getPlaceDetailApi = (params: PlaceDetailQuery): Promise<any> => {
  let url = `${ApiConfig.CORE}/stores/google/place/detail?key=${params.key}&place_id=${params.place_id}`
  return BaseAxios.get(url);
}

export const storeGetApi = (
  query?: StoreQuery,
): Promise<BaseResponse<PageResponse<StoreResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.CORE}/stores?${params}`);
};

export const storeRankGetApi = (): Promise<BaseResponse<Array<StoreRankResponse>>> => {
  return BaseAxios.get(`${ApiConfig.CORE}/ranks`);
};

export const storeDeleteApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.delete(`${ApiConfig.CORE}/stores/${id}`);
};

export const storesDetailApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.get(`${ApiConfig.CORE}/stores/${id}`);
};

export const storesDetailCustomApi = (id: number): Promise<BaseResponse<StoreCustomResponse>> => {
  return BaseAxios.get(`${ApiConfig.CORE}/stores/${id}`);
};

export const storesPutApi = (
  id: number,
  request: StoreUpdateRequest,
): Promise<BaseResponse<StoreResponse>> => {
  return BaseAxios.put(`${ApiConfig.CORE}/stores/${id}`, request);
};

export const storesPostApi = (
  request: StoreCreateRequest,
): Promise<BaseResponse<StoreResponse>> => {
  return BaseAxios.post(`${ApiConfig.CORE}/stores`, request);
};

export const storeValidateApi = (
  request: StoreCreateRequest,
): Promise<BaseResponse<StoreResponse>> => {
  return BaseAxios.post(`${ApiConfig.CORE}/stores/validate`, request);
};

export const storeGetTypeApi = (): Promise<BaseResponse<Array<StoreTypeRequest>>> => {
  return BaseAxios.get(`${ApiConfig.CORE}/store-type`);
};
