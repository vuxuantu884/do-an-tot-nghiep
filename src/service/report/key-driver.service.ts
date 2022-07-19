import BaseAxiosApi from "base/base.axios.api";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { KDOfflineTotalSalesParams, KeyDriverImportFileParams, KeyDriverParams, UpdateKeyDriverParams } from "model/report";

export const importFileApi = (
  file: File | undefined,
  params: KeyDriverImportFileParams
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
}

export const updateKeyDriversTarget = (
  params: UpdateKeyDriverParams
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.post(`${ApiConfig.KEY_DRIVER}`, params);
};

export const getKeyDriversTarget = (
  params: KeyDriverParams
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.KEY_DRIVER}`, { params });
};

export const getKDOfflineTotalSales = (
  params: KDOfflineTotalSalesParams
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.KD_OFFLINE_TOTAL_SALES}`, { params });
};

export const getKDOfflineTotalSalesLoyalty = (
  params: KDOfflineTotalSalesParams
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.OFFLINE_TOTAL_SALES_LOYALTY_LEVEL}`, { params });
};

export const getKDCustomerVisitors = (
  params: KDOfflineTotalSalesParams
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.KD_CUSTOMER_VISITORS}`, { params });
};

export const getKDOfflineOnlineTotalSales = (
  params: KDOfflineTotalSalesParams
): Promise<BaseResponse<any>> => {
  return BaseAxiosApi.get(`${ApiConfig.KD_OFFLINE_ONLINE_TOTAL_SALES}`, { params });
};



