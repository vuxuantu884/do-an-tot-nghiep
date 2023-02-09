import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import BaseResponse from "base/base.response";
import BaseAxios from "base/base.axios";
import { ApiConfig } from "config/api.config";

const getListStore = (): Promise<BaseResponse<Array<StoreResponse>>> => {
  let link = `${ApiConfig.CORE}/stores/public?simple=true&status=active&saleable=true&limit=1000`;
  return BaseAxios.get(link);
};

export const getStorePublicService = (): Promise<BaseResponse<Array<StoreResponse>>> => {
  let link = `${ApiConfig.CORE}/stores/public?status=active&saleable=true&limit=1000`;
  return BaseAxios.get(link);
};

const getSearchListStore = (name: string): Promise<BaseResponse<Array<StoreResponse>>> => {
  if (!name) name = "";
  let link = `${ApiConfig.CORE}/stores?name=${name}&simple=true&status=active&saleable=true`;
  return BaseAxios.get(link);
};

const getStoreDetail = (storeId: number): Promise<BaseResponse<StoreResponse>> => {
  let link = `${ApiConfig.CORE}/stores/${storeId}`;
  return BaseAxios.get(link);
};

const getAllPublicSimpleStoreApi = (): Promise<BaseResponse<Array<StoreResponse>>> => {
  let link = `${ApiConfig.CORE}/stores/public?simple=true&limit=1000`;
  return BaseAxios.get(link);
};

const getListStoreSimple = (): Promise<BaseResponse<Array<StoreResponse>>> => {
  let link = `${ApiConfig.CORE}/stores/simple`;
  return BaseAxios.get(link);
};

const getStoreSearchIdsApi = (
  ids: number[],
): Promise<BaseResponse<PageResponse<StoreResponse>>> => {
  let link = `${ApiConfig.CORE}/stores?ids=${ids}&limit=1000`;
  return BaseAxios.get(link);
};

const getAllStore = (): Promise<BaseResponse<Array<StoreResponse>>> => {
  let link = `${ApiConfig.CORE}/stores/public?simple=true&status=active&limit=1000`;
  return BaseAxios.get(link);
};

const getSuggestStoreInventory = (body: any): Promise<BaseResponse<Array<any>>> => {
  let link = `${ApiConfig.INVENTORY}/inventories/suggestion`;
  return BaseAxios.post(link, body);
};

export {
  getListStore,
  getStoreDetail,
  getAllPublicSimpleStoreApi,
  getListStoreSimple,
  getSearchListStore,
  getStoreSearchIdsApi,
  getAllStore,
  getSuggestStoreInventory,
};
