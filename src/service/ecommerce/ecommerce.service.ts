import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { EcommerceRequest } from "model/request/ecommerce.request";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import { generateQuery } from 'utils/AppUtils';

// config sync and setting screen
const ecommerceCreateApi = (
  request: EcommerceRequest
): Promise<BaseResponse<EcommerceResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/shops`;
  return BaseAxios.post(link, request);
};

const ecommerceUpdateApi = (
  id: number,
  EcommerceConfig: EcommerceRequest
): Promise<BaseResponse<EcommerceResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/shops/${id}`;
  return BaseAxios.put(link, EcommerceConfig);
};

const ecommerceGetApi = (): Promise<BaseResponse<EcommerceResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/shops`;
  return BaseAxios.get(link);
};

const ecommerceGetByIdApi = (
  id: number
): Promise<BaseResponse<EcommerceResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/shops/${id}`;
  return BaseAxios.get(link);
};

const ecommerceDeleteApi = (
  id: number
): Promise<BaseResponse<EcommerceResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/shops/${id}`;
  return BaseAxios.delete(link);
};
// end
// config sync connect screen
const ecommerceConnectSyncApi = (): Promise<BaseResponse<String>> => {
  let link = `${ApiConfig.ECOMMERCE}/shops/connect`;
  return BaseAxios.get(link);
};

const ecommerceGetConfigInfoApi = (query: any): Promise<BaseResponse<EcommerceResponse>> => {
  let params = generateQuery(query);
  let link = `${ApiConfig.ECOMMERCE}/shops/info?${params}`;
  return BaseAxios.get(link);
};

const ecommerceGetVariantsApi = (query: any) => {
  let params = generateQuery(query);
  let link = `${ApiConfig.ECOMMERCE}/variants?${params}`;
  return BaseAxios.get(link);
};

const ecommerceGetShopApi = (query: any) => {
  let params = generateQuery(query);
  let link = `${ApiConfig.ECOMMERCE}/shops?${params}`;
  return BaseAxios.get(link);
};

const ecommercePostVariantsApi = (query: any) => {
  let params = generateQuery(query);
  let link = `${ApiConfig.ECOMMERCE}/variants?${params}`;
  return BaseAxios.post(link);
};

const ecommerceDeleteItemApi = (query: any) => {
  let link = `${ApiConfig.ECOMMERCE}/variants/${query.id}`;
  return BaseAxios.delete(link);
};

const ecommerceDisconnectItemApi = (query: any) => {
  let link = `${ApiConfig.ECOMMERCE}/variants/${query.id}/disconnect`;
  return BaseAxios.put(link);
};

export {
  ecommerceCreateApi,
  ecommerceGetApi,
  ecommerceGetByIdApi,
  ecommerceUpdateApi,
  ecommerceDeleteApi,
  ecommerceConnectSyncApi,
  ecommerceGetConfigInfoApi,
  ecommerceGetVariantsApi,
  ecommerceGetShopApi,
  ecommercePostVariantsApi,
  ecommerceDeleteItemApi,
  ecommerceDisconnectItemApi
};
