import BaseResponse from "base/BaseResponse";
import { PRINTER_TYPES } from "domain/types/printer.type";
import {
  BasePrinterModel,
  PrinterResponseModel,
  PrinterVariableResponseModel,
  PrintFormByOrderIdsResponseModel,
} from "model/response/printer.response";

export const actionFetchListPrinter = (
  queryParams = {},
  handleData: (data: PrinterResponseModel) => void
) => {
  return {
    type: PRINTER_TYPES.listPrinter,
    payload: {
      queryParams,
      handleData,
    },
  };
};

export const actionFetchPrinterDetail = (
  id: number,
  queryParams: {},
  handleData: (data: BasePrinterModel) => void
) => {
  return {
    type: PRINTER_TYPES.getPrinterDetail,
    payload: {
      id,
      queryParams,
      handleData,
    },
  };
};

export const actionCreatePrinter = (formValue: BasePrinterModel) => {
  return {
    type: PRINTER_TYPES.createPrinter,
    payload: {
      formValue,
    },
  };
};

export const actionFetchListPrinterVariables = (
  handleData: (data: PrinterVariableResponseModel) => void
) => {
  return {
    type: PRINTER_TYPES.getListPrinterVariables,
    payload: {
      handleData,
    },
  };
};

export const actionFetchPrintFormByOrderIds = (
  ids: number[],
  handleData: (data: BaseResponse<PrintFormByOrderIdsResponseModel>) => void
) => {
  return {
    type: PRINTER_TYPES.getPrintFormByOrderIds,
    payload: {
      ids,
      handleData,
    },
  };
};
