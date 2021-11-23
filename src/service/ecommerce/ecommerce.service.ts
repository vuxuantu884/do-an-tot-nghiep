import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  PostEcommerceOrderQuery,
  PostProductEcommerceQuery,
} from "model/query/ecommerce.query";
import { EcommerceRequest } from "model/request/ecommerce.request";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import { YDPageCustomerResponse } from "model/response/ecommerce/fpage.response";
import { generateQuery } from "utils/AppUtils";

const addFpagePhone = (
  userId: string,
  phone: string
): Promise<BaseResponse<YDPageCustomerResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/fpage/users/${userId}/phones/${phone}`;
  return BaseAxios.post(link);
};
const deleteFpagePhone = (
  userId: string,
  phone: string
): Promise<BaseResponse<YDPageCustomerResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/fpage/users/${userId}/phones/${phone}`;
  return BaseAxios.delete(link);
};
const setFpageDefaultPhone = (
  userId: string,
  phone: string
): Promise<BaseResponse<YDPageCustomerResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/fpage/users/${userId}/defaultPhone/${phone}`;
  return BaseAxios.post(link);
};
const getFpageCustomer = (
  userId: string
): Promise<BaseResponse<YDPageCustomerResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/fpage/users/${userId}`;
  return BaseAxios.get(link);
};
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

const ecommerceGetByIdApi = (id: number): Promise<BaseResponse<EcommerceResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/shops/${id}`;
  return BaseAxios.get(link);
};

const ecommerceDeleteApi = (id: number): Promise<BaseResponse<EcommerceResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/shops/${id}`;
  return BaseAxios.delete(link);
};
// end
// config sync connect screen
const ecommerceConnectSyncApi = (): Promise<BaseResponse<String>> => {
  let link = `${ApiConfig.ECOMMERCE}/shops/connect`;
  return BaseAxios.get(link);
};

const ecommerceGetConfigInfoApi = (
  query: any
): Promise<BaseResponse<EcommerceResponse>> => {
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

const ecommercePostVariantsApi = (
  requestBody: PostProductEcommerceQuery
): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.ECOMMERCE}/variants`;
  return BaseAxios.post(link, requestBody);
};

const ecommerceDeleteItemApi = (ids: any) => {
  let idsParam = ids.join(",");
  let link = `${ApiConfig.ECOMMERCE}/variants?ids=${idsParam}`;
  return BaseAxios.delete(link);
};

const ecommerceDisconnectItemApi = (ids: any) => {
  let link = `${ApiConfig.ECOMMERCE}/variants/disconnect`;
  return BaseAxios.put(link, ids);
};

const ecommercePostSyncStockItemApi = (requestBody: any): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.ECOMMERCE}/variants/stockSync`;
  return BaseAxios.post(link, requestBody);
};

const ecommerceGetCategoryListApi = (query: any) => {
  let params = generateQuery(query);
  let link = `${ApiConfig.ECOMMERCE}/categories?${params}`;
  return BaseAxios.get(link);
};

const ecommercePutConnectItemApi = (requestBody: any) => {
  let link = `${ApiConfig.ECOMMERCE}/variants`;
  return BaseAxios.put(link, requestBody);
};

//ecommerce order api
const postEcommerceOrderApi = (
  requestBody: PostEcommerceOrderQuery
): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.ECOMMERCE}/orders`;
  return BaseAxios.post(link, requestBody);
};

// print ecommerce orders api
const printEcommerceOrdersApi = (requestBody: any) => {
  let url = `${ApiConfig.ECOMMERCE}/orders/print-forms`;
  return BaseAxios.post(url, requestBody);
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
  ecommerceDisconnectItemApi,
  ecommercePostSyncStockItemApi,
  ecommerceGetCategoryListApi,
  ecommercePutConnectItemApi,
  postEcommerceOrderApi,
  getFpageCustomer,
  addFpagePhone,
  deleteFpagePhone,
  setFpageDefaultPhone,
  printEcommerceOrdersApi,
};
