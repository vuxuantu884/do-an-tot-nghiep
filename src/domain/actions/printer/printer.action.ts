import { PRINTER_TYPES } from "domain/types/printer.type";
import {
  PrinterModel,
  PrinterResponseModel,
} from "model/response/printer.response";

export const actionFetchListPrinter = (
  params = {},
  handleData: (data: PrinterResponseModel) => void
) => {
  return {
    type: PRINTER_TYPES.listPrinter,
    payload: {
      params,
      handleData,
    },
  };
};

export const actionFetchPrinterDetail = (
  id: number,
  query: {},
  handleData: (data: PrinterModel) => void
) => {
  return {
    type: PRINTER_TYPES.getPrinterDetail,
    payload: {
      id,
      query,
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
