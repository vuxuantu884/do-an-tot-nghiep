import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { BaseQuery } from "model/base/base.query";
import {
  PrinterModel,
  PrinterResponseModel,
} from "model/response/printer.response";
import { generateQuery } from "utils/AppUtils";

interface PrintParams extends BaseQuery {
  "print-size"?: string;
}

export const getListPrinterService = (
  query: BaseQuery
): Promise<BaseResponse<PrinterResponseModel>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.CORE}/print-template?${queryString}`);
};

export const getPrinterDetailService = (
  id: number,
  query: PrintParams = {}
): Promise<BaseResponse<PrinterResponseModel>> => {
  const queryString = generateQuery(query);
  console.log("query", query);
  return BaseAxios.get(`${ApiConfig.CORE}/print-template/${id}?${queryString}`);
};

export const createPrinterService = (
  formValue: PrinterModel
): Promise<BaseResponse<PrinterResponseModel>> => {
  return BaseAxios.post(`${ApiConfig.CORE}/print-template`, formValue);
};
