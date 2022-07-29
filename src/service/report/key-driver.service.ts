import { AxiosRequestConfig } from "axios";
import BaseAxiosApi from "base/base.axios.api";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  AnalyticDataQuery,
  CustomerPhoneSMSCountersParams,
  KDOfflineTotalSalesParams,
  KeyDriverImportFileParams,
  KeyDriverOnlineParams,
  KeyDriverParams,
  UpdateKeyDriverParams,
} from "model/report";

export const importFileApi = (
  file: File | undefined,
  params: KeyDriverImportFileParams,
): Promise<BaseResponse<string[]>> => {
  let url = `${ApiConfig.KEY_DRIVER}/import`;
  const formData = new FormData();
  const { headRow, type } = params;
  formData.append("headRow", headRow.toString());
  formData.append("type", type);
  if (file) {
    formData.append("file", file);
  }

  return BaseAxiosApi.post(url, formData);
};

export const updateKeyDriversTarget = (
  params: UpdateKeyDriverParams,
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.post(`${ApiConfig.KEY_DRIVER}`, params);
};

export const getKeyDriversTarget = (
  params: KeyDriverParams,
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.KEY_DRIVER}`, { params });
};

export const getKDOfflineTotalSales = (
  params: KDOfflineTotalSalesParams,
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.KD_OFFLINE_TOTAL_SALES}`, { params });
};

export const getKDOfflineTotalSalesLoyalty = (
  params: KDOfflineTotalSalesParams,
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.OFFLINE_TOTAL_SALES_LOYALTY_LEVEL}`, {
    params,
  });
};

export const getKDCustomerVisitors = (
  params: KDOfflineTotalSalesParams,
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.KD_CUSTOMER_VISITORS}`, { params });
};

export const getKDOfflineOnlineTotalSales = (
  params: KDOfflineTotalSalesParams,
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.KD_OFFLINE_ONLINE_TOTAL_SALES}`, {
    params,
  });
};

export const getCustomerPhoneSMSCounters = (
  params: CustomerPhoneSMSCountersParams,
  config?: AxiosRequestConfig,
): Promise<BaseResponse<any>> => {
  const {
    month,
    year,
    storeIds,
    entityName,
    loyaltyLevel,
    reportedBy,
    mergeLoyaltyLevel,
  } = params;
  let endpoint = `${ApiConfig.CUSTOMER_COUNTERS}?month.equals=${month}&year.equals=${year}&entityName.equals=${entityName}`;
  if (storeIds?.length) {
    storeIds.forEach((id, index) => {
      endpoint += `&storeId.in[${index}]=${id}`;
    });
  }
  if (reportedBy) {
    endpoint += `&reportedBy.equals=${reportedBy}`;
  }
  if (loyaltyLevel) {
    endpoint += `&loyaltyLevel.equals=${loyaltyLevel}`;
  }
  if (mergeLoyaltyLevel !== undefined) {
    endpoint += `&mergeLoyaltyLevel.equals=${mergeLoyaltyLevel}`;
  }
  return BaseAxiosApi.get(endpoint, { ...config });
};

export const updateCustomerPhoneSMSCounters = (
  params: any,
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.post(`${ApiConfig.CUSTOMER_COUNTERS}`, params);
};

export const getKeyDriverOnlineApi = (
  params: KeyDriverOnlineParams,
): Promise<BaseResponse<Omit<AnalyticDataQuery, "query">>> => {
  return BaseAxiosApi.get(`reports/query/key-drivers`, { params });
};
