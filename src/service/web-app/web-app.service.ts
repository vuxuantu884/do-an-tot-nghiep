import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  WebAppExitProgressDownloadQuery,
  WebAppPostOrderQuery,
  WebAppPostProductQuery,
  WebAppRequestSyncStockQuery,
  WebAppConfigRequest,
} from "model/query/web-app.query";
import { WebAppResponse } from "model/response/web-app/ecommerce.response";
import { generateQuery } from "utils/AppUtils";
import {EcommerceCreateLogistic} from "../../model/ecommerce/ecommerce.model";

// config sync and setting screen
const webAppCreateConfigApi = (
  request: WebAppConfigRequest
): Promise<BaseResponse<WebAppResponse>> => {
  let link = `${ApiConfig.WEB_APP}/shops`;
  return BaseAxios.post(link, request);
};

const webAppUpdateConfigApi = (
  id: number,
  EcommerceConfig: WebAppConfigRequest
): Promise<BaseResponse<WebAppResponse>> => {
  let link = `${ApiConfig.WEB_APP}/shops/${id}`;
  return BaseAxios.put(link, EcommerceConfig);
};

const webAppGetByIdApi = (
  id: number
): Promise<BaseResponse<WebAppResponse>> => {
  let link = `${ApiConfig.WEB_APP}/shops/${id}`;
  return BaseAxios.get(link);
};

const webAppDeleteApi = (
  id: number
): Promise<BaseResponse<WebAppResponse>> => {
  let link = `${ApiConfig.WEB_APP}/shops/${id}`;
  return BaseAxios.delete(link);
};
// end
// config sync connect screen
const webAppConnectSyncApi = (
  webAppId: number
): Promise<BaseResponse<String>> => {
  let link = `${ApiConfig.WEB_APP}/shops/connect/${webAppId}`;
  return BaseAxios.get(link);
};

const webAppGetConfigInfoApi = (
  params: any
): Promise<BaseResponse<WebAppResponse>> => {
  let link = `${ApiConfig.WEB_APP}/shops/info?${params}`;
  return BaseAxios.get(link);
};

const webAppGetVariantsApi = (query: any) => {
  let params = generateQuery(query);
  let link = `${ApiConfig.WEB_APP}/variants?${params}`;
  return BaseAxios.get(link);
};

const webAppGetShopApi = (query: any) => {
  let params = generateQuery(query);
  let link = `${ApiConfig.WEB_APP}/shops?${params}`;
  return BaseAxios.get(link);
};

const webAppDownloadProductApi = (
  requestBody: WebAppPostProductQuery
): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.WEB_APP}/variants`;
  return BaseAxios.post(link, requestBody);
};

const webAppDeleteProductApi = (ids: any) => {
  let idsParam = ids.join(",");
  let link = `${ApiConfig.WEB_APP}/variants?ids=${idsParam}`;
  return BaseAxios.delete(link);
};

const webAppDisconnectProductApi = (ids: any) => {
  let link = `${ApiConfig.WEB_APP}/variants/disconnect`;
  return BaseAxios.put(link, ids);
};

const webAppSyncStockProductApi = (
  requestBody: WebAppRequestSyncStockQuery
): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.WEB_APP}/variants/stock-sync`;
  return BaseAxios.post(link, requestBody);
};

const webAppSyncOrderApi = (
  requestBody: any
): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.WEB_APP}/orders/retry-download`;
  return BaseAxios.post(link, requestBody);
};

const webAppGetCategoryListApi = (query: any) => {
  let params = generateQuery(query);
  let link = `${ApiConfig.WEB_APP}/categories?${params}`;
  return BaseAxios.get(link);
};

const webAppPutConnectProductApi = (requestBody: any) => {
  let link = `${ApiConfig.WEB_APP}/variants`;
  return BaseAxios.put(link, requestBody);
};

//ecommerce order api
const webAppDownloadOrderApi = (
  requestBody: WebAppPostOrderQuery
): Promise<BaseResponse<any>> => {
  let link = `${ApiConfig.WEB_APP}/orders`;
  return BaseAxios.post(link, requestBody);
};

//get progress download ecommerce orders
const getProgressDownloadEcommerceApi = (
  process_id: any
): Promise<BaseResponse<any>> => {
  const requestUrl = `${ApiConfig.WEB_APP}/orders/download-process/${process_id}`;
  return BaseAxios.get(requestUrl);
};

//get order mapping list api
const webAppGetOrderMappingListApi = (query: any) => {
  let params = generateQuery(query);
  let link = `${ApiConfig.WEB_APP}/orders/mapping-sync?${params}`;
  return BaseAxios.get(link);
};

const webAppGetStoreAddressApi = (query : any) => {
  let params = generateQuery(query);
  let link = `${ApiConfig.WEB_APP}/logistic/store-address?${params}`;
  return BaseAxios.get(link);
}

const webAppCreateLogisticApi = (requestBody : EcommerceCreateLogistic) => {
  let link = `${ApiConfig.WEB_APP}/logistic/shipping-order`;
  return BaseAxios.post(link, requestBody);
}


export const webAppConcatenateByExcelApi = (formData: FormData) => {
  return BaseAxios.post(`${ApiConfig.WEB_APP}/import-export/variants-import`, formData, {
    headers: { "content-type": "multipart/form-data" },
  });
}

// get web app jobs api
export const getWebAppJobsApi = (
  process_id: any
): Promise<BaseResponse<any>> => {
const requestUrl = `${ApiConfig.WEB_APP}/jobs/${process_id}`;
return BaseAxios.get(requestUrl);
};

//exit web app jobs api
export const webAppExitJobsApi = (
  query: WebAppExitProgressDownloadQuery
): Promise<BaseResponse<any>> => {
  const requestUrl = `${ApiConfig.WEB_APP}/jobs/${query.processId}`;
  return BaseAxios.put(requestUrl);
};

// get web app delivery note
export const webAppGetPrintForm = (
    requestBody: any
): Promise<BaseResponse<any>> => {
  const requestUrl = `${ApiConfig.WEB_APP}/orders/print-forms`;
  return BaseAxios.post(requestUrl, requestBody);
};

export {
  webAppCreateConfigApi,
  webAppGetShopApi,
  webAppGetByIdApi,
  webAppUpdateConfigApi,
  webAppDeleteApi,
  webAppConnectSyncApi,
  webAppGetConfigInfoApi,
  webAppGetVariantsApi,
  webAppDownloadProductApi,
  webAppDeleteProductApi,
  webAppDisconnectProductApi,
  webAppSyncStockProductApi,
  webAppSyncOrderApi,
  webAppGetCategoryListApi,
  webAppPutConnectProductApi,
  webAppDownloadOrderApi,
  getProgressDownloadEcommerceApi,
  webAppGetOrderMappingListApi,
  webAppGetStoreAddressApi,
  webAppCreateLogisticApi
};
