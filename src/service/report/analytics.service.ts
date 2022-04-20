import { AxiosRequestConfig } from "axios";
import BaseAxiosApi from "base/base.axios.api";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { AnalyticCustomize, AnalyticQueryMany, AnalyticTemplateParams } from "model/report/analytics.model";
import qs from "query-string";
import { removeSpacesAndEnterCharacters } from "utils/ReportUtils";

export const executeAnalyticsQueryService = (
  params: AnalyticTemplateParams,
  config?: AxiosRequestConfig
): Promise<BaseResponse<any>> => {
  params.q = removeSpacesAndEnterCharacters(params.q);
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}/query`, { params, ...config });
};

export const executeManyAnalyticsQueryService = (
  params: AnalyticQueryMany,
  config?: AxiosRequestConfig
): Promise<BaseResponse<any>> => {
  const { q } = params;
  if (Array.isArray(q) && q.length > 0) {
    q.forEach(item => {
      item = removeSpacesAndEnterCharacters(item);
    });
  }
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}/queries`, { params, ...config });
};

export const getCustomerVisitors = (
  params: { month: number, year: number, storeIds?: number[] },
  config?: AxiosRequestConfig
): Promise<BaseResponse<any>> => {
  const { month, year, storeIds } = params;
  if (storeIds?.length) {
    let endpoint = `${ApiConfig.CUSTOMER_VISITORS}?month.equals=${month}&year.equals=${year}`;
    storeIds.forEach((id, index) => {
      endpoint += `&storeId.in[${index}]=${id}`;
    })
    return BaseAxiosApi.get(endpoint, { ...config });
  } else {
    return BaseAxiosApi.get(`${ApiConfig.CUSTOMER_VISITORS}?month.equals=${month}&year.equals=${year}`, { ...config });
  }
};

export const updateCustomerVisitors = (
  params: any
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.post(`${ApiConfig.CUSTOMER_VISITORS}`, params);
};

export const getAnalyticsMetadataService = (
  params: AnalyticTemplateParams
): Promise<BaseResponse<any>> => {
  params.q = removeSpacesAndEnterCharacters(params.q);
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}/metadata`, { params });
};

export const getAnalyticsCustomByIdService = (id: number): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}/${id}`);
};

export const getAnalyticsCustomByService = (params?: {
  [key: string]: any;
}): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}`, {
    params,
    paramsSerializer: (params) => {
      return qs.stringify(params, { arrayFormat: "bracket" });
    },
  });
};

export const saveAnalyticsCustomService = (
  params: AnalyticCustomize
): Promise<BaseResponse<any>> => {
  params.query = removeSpacesAndEnterCharacters(params.query);
  params.chart_query = params.chart_query ? removeSpacesAndEnterCharacters(params.chart_query) : undefined;
  return BaseAxiosApi.post(`${ApiConfig.ANALYTICS}`, params);
};

export const updateAnalyticsCustomService = (
  id: number,
  params: Partial<AnalyticCustomize>
): Promise<BaseResponse<any>> => {
  params.query = params.query ? removeSpacesAndEnterCharacters(params.query) : undefined;
  return BaseAxiosApi.put(`${ApiConfig.ANALYTICS}/${id}`, params);
};

export const deleteAnalyticsCustomService = (id: number): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.delete(`${ApiConfig.ANALYTICS}/${id}`);
};
