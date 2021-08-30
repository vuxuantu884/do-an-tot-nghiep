import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { BaseQuery } from "model/base/base.query";
import {
  BasePrinterModel,
  PrinterResponseModel,
  PrinterVariableResponseModel,
} from "model/response/printer.response";
import { generateQuery } from "utils/AppUtils";

interface PrintParams extends BaseQuery {
  "print-size"?: string;
}

export const getListPrinterService = (
  queryParams: BaseQuery
): Promise<BaseResponse<PrinterResponseModel>> => {
  const queryString = generateQuery(queryParams);
  return BaseAxios.get(`${ApiConfig.CORE}/print-template?${queryString}`);
};

export const getPrinterDetailService = (
  id: number,
  queryParams: PrintParams = {}
): Promise<BaseResponse<PrinterResponseModel>> => {
  const queryString = generateQuery(queryParams);
  return BaseAxios.get(`${ApiConfig.CORE}/print-template/${id}?${queryString}`);
};

export const createPrinterService = (
  formValue: BasePrinterModel
): Promise<BaseResponse<PrinterResponseModel>> => {
  return BaseAxios.post(`${ApiConfig.CORE}/print-template`, formValue);
};

export const getListPrinterVariablesService = (): Promise<
  BaseResponse<PrinterVariableResponseModel>
> => {
  return BaseAxios.get(
    `${ApiConfig.CONTENT}/common/enums?fields=PRINT_SIZE, PRINT_ORDER_VARIABLE, PRINT_STORE_VARIABLE, PRINT_PRODUCT_VARIABLE, PRINT_SHIPMENT_VARIABLE`
  );
};

export const getPrintFormByOrderIdsService = (
  ids: string[]
): Promise<BaseResponse<PrinterVariableResponseModel>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/orders/print_forms?ids=${ids}`);
};
