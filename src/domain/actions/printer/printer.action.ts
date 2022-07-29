import BaseResponse from "base/base.response";
import { PRINTER_TYPES } from "domain/types/printer.type";
import {
  BasePrinterModel,
  PrinterInventoryTransferResponseModel,
  PrinterResponseModel,
  PrinterVariableResponseModel,
  PrintFormByOrderIdsResponseModel,
} from "model/response/printer.response";

export const actionFetchListPrinter = (
  queryParams = {},
  handleData: (data: PrinterResponseModel) => void,
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
  handleData: (data: BasePrinterModel) => void,
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

export const actionCreatePrinter = (formValue: BasePrinterModel, handleData: () => void) => {
  return {
    type: PRINTER_TYPES.createPrinter,
    payload: {
      formValue,
      handleData,
    },
  };
};

export const actionFetchListPrinterVariables = (
  handleData: (data: PrinterVariableResponseModel) => void,
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
  type: string,
  handleData: (data: BaseResponse<PrintFormByOrderIdsResponseModel>) => void,
) => {
  return {
    type: PRINTER_TYPES.getPrintFormByOrderIds,
    payload: {
      ids,
      type,
      handleData,
    },
  };
};

export const actionFetchPrintFormByInventoryTransferIds = (
  ids: number[],
  type: string,
  handleData: (data: Array<PrinterInventoryTransferResponseModel>) => void,
) => {
  return {
    type: PRINTER_TYPES.getPrintFormByInventoryTransferIds,
    payload: {
      ids,
      type,
      handleData,
    },
  };
};
