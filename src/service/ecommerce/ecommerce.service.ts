import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  ExitProgressDownloadEcommerceQuery,
  PostEcommerceOrderQuery,
  PostProductEcommerceQuery,
  RequestSyncStockQuery,
} from "model/query/ecommerce.query";
import { EcommerceRequest } from "model/request/ecommerce.request";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import { YDPageCustomerResponse } from "model/response/ecommerce/fpage.response";
import { generateQuery } from "utils/AppUtils";
import {EcommerceCreateLogistic} from "../../model/ecommerce/ecommerce.model";

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
const ecommerceConnectSyncApi = (
  ecommerceId: number
): Promise<BaseResponse<String>> => {
  let link = `${ApiConfig.ECOMMERCE}/shops/connect/${ecommerceId}`;
  return BaseAxios.get(link);
};

const ecommerceGetConfigInfoApi = (
  params: any
): Promise<BaseResponse<EcommerceResponse>> => {
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

const ecommercePostSyncStockItemApi = (
  requestBody: RequestSyncStockQuery
): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.ECOMMERCE}/variants/stock-sync`;
  return BaseAxios.post(link, requestBody);
};

const ecommerceSyncStockItemApi = (
  requestBody: any
): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.ECOMMERCE}/orders/retry-download`;
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

//get progress download ecommerce orders
const getProgressDownloadEcommerceApi = (
  process_id: any
): Promise<BaseResponse<any>> => {
  const requestUrl = `${ApiConfig.ECOMMERCE}/orders/download-process/${process_id}`;
  return BaseAxios.get(requestUrl);
};

//get progress download ecommerce orders
const exitProgressDownloadEcommerceApi = (
  query: ExitProgressDownloadEcommerceQuery
): Promise<BaseResponse<any>> => {
  const requestUrl = `${ApiConfig.ECOMMERCE}/orders/download-process/${query.processId}`;
  return BaseAxios.put(requestUrl);
};

//get order mapping list api
const getOrderMappingListApi = (query: any) => {
  let params = generateQuery(query);
  let link = `${ApiConfig.ECOMMERCE}/orders/mapping-sync?${params}`;
  return BaseAxios.get(link);
};

const getEcommerceStoreAddressApi = (query : any) => {
  let params = generateQuery(query);
  let link = `${ApiConfig.ECOMMERCE}/logistic/store-address?${params}`;
  return BaseAxios.get(link);
}

const createEcommerceLogisticApi = (requestBody : EcommerceCreateLogistic) => {
  let link = `${ApiConfig.ECOMMERCE}/logistic/shipping-order`;
  return BaseAxios.post(link, requestBody);
}


export const importConcatenateByExcelService = (formData: FormData) => {
  return BaseAxios.post(`${ApiConfig.ECOMMERCE}/import-export/variants-import`, formData, {
    headers: { "content-type": "multipart/form-data" },
  });
}

// get ecommerce jobs api
export const getEcommerceJobsApi = (
  process_id: any
): Promise<BaseResponse<any>> => {
const requestUrl = `${ApiConfig.ECOMMERCE}/jobs/${process_id}`;
return BaseAxios.get(requestUrl);
};

//exit ecommerce jobs api
export const exitEcommerceJobsApi = (
  query: ExitProgressDownloadEcommerceQuery
): Promise<BaseResponse<any>> => {
  const requestUrl = `${ApiConfig.ECOMMERCE}/jobs/${query.processId}`;
  return BaseAxios.put(requestUrl);
};

// get ecommerce delivery note
export const getEcommercePrintForm = (
    requestBody: any
): Promise<BaseResponse<any>> => {
  const requestUrl = `${ApiConfig.ECOMMERCE}/orders/print-forms`;
  return BaseAxios.post(requestUrl, requestBody);
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
  ecommerceSyncStockItemApi,
  ecommerceGetCategoryListApi,
  ecommercePutConnectItemApi,
  postEcommerceOrderApi,
  getProgressDownloadEcommerceApi,
  exitProgressDownloadEcommerceApi,
  getFpageCustomer,
  addFpagePhone,
  deleteFpagePhone,
  setFpageDefaultPhone,
  getOrderMappingListApi,
  getEcommerceStoreAddressApi,
  createEcommerceLogisticApi
};
