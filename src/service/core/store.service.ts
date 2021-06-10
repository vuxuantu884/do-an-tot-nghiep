import { StoreResponse } from './../../model/response/core/store.response';
import BaseResponse from 'base/BaseResponse';
import BaseAxios from "base/BaseAxios";
import { ApiConfig } from "config/ApiConfig";

const getListStore = (): Promise<BaseResponse<Array<StoreResponse>>> => {
  let link = `${ApiConfig.CORE}/stores?is_simple=true`
  return BaseAxios.get(link);
};

const getStoreDetail = (storeId: number): Promise<BaseResponse<StoreResponse>> => {
  let link = `${ApiConfig.CORE}/stores/${storeId}`
  return BaseAxios.get(link);
};

export {getListStore, getStoreDetail};