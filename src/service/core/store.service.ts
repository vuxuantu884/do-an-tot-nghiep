import { StoreResponse } from "model/core/store.model";
import BaseResponse from "base/base.response";
import BaseAxios from "base/base.axios";
import { ApiConfig } from "config/ApiConfig";

const getListStore = (): Promise<BaseResponse<Array<StoreResponse>>> => {
  let link = `${ApiConfig.CORE}/stores?simple=true&status=active`;
  return BaseAxios.get(link);
};

const getStoreDetail = (
  storeId: number
): Promise<BaseResponse<StoreResponse>> => {
  let link = `${ApiConfig.CORE}/stores/${storeId}`;
  return BaseAxios.get(link);
};

const getListStoreSimple = (): Promise<BaseResponse<Array<StoreResponse>>> => {
  let link = `${ApiConfig.CORE}/stores/simple`;
  return BaseAxios.get(link);
};

export { getListStore, getStoreDetail, getListStoreSimple };
