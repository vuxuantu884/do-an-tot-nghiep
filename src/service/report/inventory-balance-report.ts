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

export const getInventoryBalanceReportApi = (
  params: InventoryBalanceReportParams,
): Promise<any> => {
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}/inventory`, { params });
};
