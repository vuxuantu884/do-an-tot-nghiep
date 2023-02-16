import BaseAxiosApi from "base/base.axios.api";
import { ApiConfig } from "config/api.config";
import { SellingPowerReportParams } from "screens/reports/common/interfaces/selling-power-report.interface";

export interface InventoryBalanceReportParams {
  startDate: string;
  endDate: string;
  storeName: string;
  listProductGroupLv1: string;
  listProductGroupLv2: string;
  listSKU: string;
}

export interface InventoryBalanceFilterParams {
  productGroupLv1?: string;
  productGroupLv2?: string;
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

export const getSellingPowerReportApi = (params: SellingPowerReportParams): Promise<any> => {
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}/selling-power`, { params });
};
