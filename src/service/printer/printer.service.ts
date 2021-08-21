import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { BaseQuery } from "model/base/base.query";
import { PrinterResponseModel } from "model/response/printer.response";
import { generateQuery } from "utils/AppUtils";

export const getListPrinterService = (
  query: BaseQuery
): Promise<BaseResponse<PrinterResponseModel>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.CORE}/print-template?${queryString}`);
};

export const getPrinterDetailService = (
  id: number
): Promise<BaseResponse<PrinterResponseModel>> => {
  return BaseAxios.get(`${ApiConfig.CORE}/print-template/${id}`);
};
