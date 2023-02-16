import BaseAxiosApi from "base/base.axios.api";
import { ApiConfig } from "config/api.config";
import { GrossProfitReportParams } from "screens/reports/common/interfaces/gross-profit.interface";

export const getGrossProfitReportApi = (params: GrossProfitReportParams): Promise<any> => {
  return BaseAxiosApi.get(`${ApiConfig.ANALYTICS}/gross-profit`, { params });
};
