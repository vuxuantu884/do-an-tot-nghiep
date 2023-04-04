import { AxiosRequestConfig } from "axios";
import BaseAxios from "base/base.axios";
import BaseAxiosApi from "base/base.axios.api";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { AppConfig } from "config/app.config";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import {
  AnalyticCustomize,
  AnalyticDataQuery,
  AnalyticQueryMany,
  AnalyticTemplateParams,
} from "model/report/analytics.model";
import qs from "query-string";
import { CustomerVisitorsType } from "screens/reports/common/enums/customer-visitors-type.enum";
import { generateQuery } from "utils/AppUtils";
import { removeSpacesAndEnterCharacters } from "utils/ReportUtils";

const isUat = AppConfig.ENV === "UAT"; // báo cáo không có server trên UAT=> trên mt uat không call api
export const NO_SERVER_ERROR = "Báo cáo không có trên môi trường UAT";

export const executeAnalyticsQueryService = (
  params: AnalyticTemplateParams,
  config?: AxiosRequestConfig,
): Promise<BaseResponse<AnalyticDataQuery>> => {
  if (isUat) {
    return Promise.reject(new Error(NO_SERVER_ERROR));
  }
  params.q = removeSpacesAndEnterCharacters(params.q);
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}/query`, {
    params,
    ...config,
  });
};

export const executeManyAnalyticsQueryService = (
  params: AnalyticQueryMany,
  config?: AxiosRequestConfig,
): Promise<BaseResponse<any>> => {
  if (isUat) {
    return Promise.reject(new Error(NO_SERVER_ERROR));
  }
  const { q } = params;
  if (Array.isArray(q) && q.length > 0) {
    q.forEach((item) => {
      item = removeSpacesAndEnterCharacters(item);
    });
  }
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}/queries`, {
    params,
    ...config,
  });
};

export const getCustomerVisitors = (
  params: {
    month: number;
    year: number;
    storeIds: string;
    assigneeCodes?: any[];
    source: CustomerVisitorsType;
  },
  config?: AxiosRequestConfig,
): Promise<BaseResponse<any>> => {
  const { month, year, storeIds, assigneeCodes, source } = params;
  let endpoint = `${ApiConfig.CUSTOMER_VISITORS}?month.equals=${month}&year.equals=${year}&source.in[0]=${source}&storeIds=${storeIds}`;
  let assigneeCodeParam = "";
  if (assigneeCodes?.length) {
    assigneeCodes.forEach((id, index) => {
      assigneeCodeParam += `&assigneeCode.in[${index}]=${id.toLowerCase()}`;
    });
  }
  return BaseAxiosApi.get(`${endpoint}${assigneeCodeParam}`, { ...config });
};

export const updateCustomerVisitors = (params: any): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.post(`${ApiConfig.CUSTOMER_VISITORS}`, params);
};

export const getAnalyticsMetadataService = (
  params: AnalyticTemplateParams,
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
  params: AnalyticCustomize,
): Promise<BaseResponse<any>> => {
  params.query = removeSpacesAndEnterCharacters(params.query);
  params.chart_query = params.chart_query
    ? removeSpacesAndEnterCharacters(params.chart_query)
    : undefined;
  return BaseAxiosApi.post(`${ApiConfig.ANALYTICS}`, params);
};

export const updateAnalyticsCustomService = (
  id: number,
  params: Partial<AnalyticCustomize>,
): Promise<BaseResponse<any>> => {
  params.query = params.query ? removeSpacesAndEnterCharacters(params.query) : undefined;
  return BaseAxiosApi.put(`${ApiConfig.ANALYTICS}/${id}`, params);
};

export const deleteAnalyticsCustomService = (id: number): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.delete(`${ApiConfig.ANALYTICS}/${id}`);
};

export const searchVariantsSimpleService = (query: {
  skus?: string;
  store_ids?: string | null;
}): Promise<BaseResponse<PageResponse<VariantResponse>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/variants/simple?${queryString}`);
};
