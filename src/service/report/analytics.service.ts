import { AxiosRequestConfig } from "axios";
import BaseAxiosApi from "base/base.axios.api";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { AnalyticCustomize, AnalyticTemplateParams } from "model/report/analytics.model";
import qs from "query-string";
import { removeSpacesAndEnterCharacters } from "utils/ReportUtils";

export const executeAnalyticsQueryService = (
  params: AnalyticTemplateParams,
  config?: AxiosRequestConfig
): Promise<BaseResponse<any>> => {
  params.q = removeSpacesAndEnterCharacters(params.q);
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}/query`, { params, ...config });
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