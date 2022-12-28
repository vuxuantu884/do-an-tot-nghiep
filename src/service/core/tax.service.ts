import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { TaxConfigResponse } from "model/core/tax.model";

export const getTaxConfigApi = (): Promise<BaseResponse<TaxConfigResponse>> => {
  return BaseAxios.get(`${ApiConfig.CORE}/tax`);
};

export const updateTaxConfig = (
  data: Pick<TaxConfigResponse, "tax_included">,
): Promise<BaseResponse<TaxConfigResponse>> => {
  return BaseAxios.put(`${ApiConfig.CORE}/tax/configuration`, data);
};
