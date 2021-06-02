import { StoreModel } from 'model/other/StoreModel';
import BaseResponse from 'base/BaseResponse';
import BaseAxios from "base/BaseAxios";
import { ApiConfig } from "config/ApiConfig";

const getListStore = (): Promise<BaseResponse<Array<StoreModel>>> => {
  let link = `${ApiConfig.CORE}/stores/simple`
  return BaseAxios.get(link);
};

const getStoreDetail = (storeId: number): Promise<BaseResponse<StoreModel>> => {
  let link = `${ApiConfig.CORE}/stores/${storeId}`
  return BaseAxios.get(link);
};

export {getListStore, getStoreDetail};