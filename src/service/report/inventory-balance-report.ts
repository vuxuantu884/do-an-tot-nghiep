import BaseAxiosApi from "base/base.axios.api";
import { ApiConfig } from "config/api.config";

export interface InventoryBalanceReportParams {
  startDate: string;
  endDate: string;
  storeName: string;
  listProductGroupLv1: string;
  listProductGroupLv2: string;
  listSKU: string;
}

export interface InventoryBalanceFilterParams {
  productGroupLV1?: string;
  productGroupLV2?: string;
}

export const getInventoryBalanceReportApi = (
  params: InventoryBalanceReportParams,
): Promise<any> => {
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}/inventory`, { params });
};

export const getProductInfoApi = (params: InventoryBalanceFilterParams): Promise<any> => {
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}/filter`, { params });
};

export const getStoreByProvinceApi = (province?: string): Promise<any> => {
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}/store`, { params: { province } });
};
