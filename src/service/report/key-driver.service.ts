import { AxiosRequestConfig } from "axios";
import BaseAxiosApi from "base/base.axios.api";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  AnalyticDataQuery,
  CustomerPhoneSMSCountersParams,
  KDOfflineTotalSalesParams,
  KeyCounterParams,
  KeyDriverImportFileParams,
  KeyDriverOnlineParams,
  KeyDriverParams,
  MonthlyCounter,
  UpdateKeyDriverParams,
} from "model/report";

/* keydriver offline api */
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

export const getKeyDriversTarget = (params: KeyDriverParams): Promise<BaseResponse<any>> => {
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
  const { month, year, storeIds, entityName, loyaltyLevel, reportedBy, mergeLoyaltyLevel } = params;
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

export const updateCustomerPhoneSMSCounters = (params: any): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.post(`${ApiConfig.CUSTOMER_COUNTERS}`, params);
};

export const uploadPotentialRegistedFile = (params: any): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.post(`${ApiConfig.POTENTIAL_CUSTOMER_REGISTED}`, params);
};

export const uploadPotentialBoughtFile = (params: any): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.post(`${ApiConfig.POTENTIAL_CUSTOMER_BOUGHT}`, params);
};

export const getKDOfflineTotalSalesPotential = (
  params: KDOfflineTotalSalesParams,
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.OFFLINE_TOTAL_SALES_POTENTIAL}`, {
    params,
  });
};

export const getKDCallLoyalty = (params: KDOfflineTotalSalesParams): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.OFFLINE_CALL_LOYALTY_LEVEL}`, {
    params,
  });
};

export const getKDSmsLoyalty = (params: KDOfflineTotalSalesParams): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.OFFLINE_SMS_LOYALTY_LEVEL}`, {
    params,
  });
};

export const getKDOfflineProfit = (
  params: KDOfflineTotalSalesParams,
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.OFFLINE_PROFIT}`, {
    params,
  });
};

export const getKDFollowFanpage = (
  params: KDOfflineTotalSalesParams,
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.OFFLINE_FOLLOW_FANPAGE}`, {
    params,
  });
};

export const getKDOfflineStorePerformance = (
  params: KDOfflineTotalSalesParams,
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.OFFLINE_STORE_PERFORMANCE}`, {
    params,
  });
};

export const getKDOfflineNPS = (params: KDOfflineTotalSalesParams): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.OFFLINE_NPS}`, {
    params,
  });
};

/* keydriver offline api */

/* keydriver online api */
export const getKeyDriverOnlineApi = (
  params: KeyDriverOnlineParams,
): Promise<BaseResponse<Omit<AnalyticDataQuery, "query">>> => {
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}/query/key-drivers`, { params });
};

export const actualDayUpdateApi = (
  params: any,
): Promise<BaseResponse<Omit<AnalyticDataQuery, "query">>> => {
  return BaseAxiosApi.post(`/fact-key-drivers`, { ...params });
};

export const getMetadataKeyDriverOnlineApi = (
  params: KeyDriverOnlineParams,
): Promise<BaseResponse<Omit<AnalyticDataQuery, "query">>> => {
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}/metadata/key-drivers`, { params });
};

export const onlineCounterService = (params: MonthlyCounter): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.post(`/monthly-counters`, params);
};

export const getOnlineCounterService = (params: KeyCounterParams): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`/monthly-counters`, { params });
};
/* keydriver online api */
