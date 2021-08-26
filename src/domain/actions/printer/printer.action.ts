import { PRINTER_TYPES } from "domain/types/printer.type";
import {
  PrinterModel,
  PrinterResponseModel,
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
  handleData: (data: PrinterModel) => void
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

export const actionCreatePrinter = (formValue: PrinterModel) => {
  return {
    type: PRINTER_TYPES.createPrinter,
    payload: {
      formValue,
    },
  };
};
