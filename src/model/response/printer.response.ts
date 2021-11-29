import { BaseMetadata } from "model/base/base-metadata.response";

export interface BasePrinterModel {
  company: string;
  company_id: number;
  is_default: boolean;
  id: number;
  name: string;
  print_size: string;
  store?: string;
  store_id: number;
  template: string;
  type: string;
}

/**
 * List printer response
 */
export interface PrinterResponseModel {
  items: BasePrinterModel[];
  metadata: BaseMetadata;
}

/**
 * single printer detail response
 */
export interface SinglePrinterResponseModel {
  items: BasePrinterModel[];
  metadata: BaseMetadata;
}

/**
 * printer variables response
 */
export interface PrinterVariableResponseModel {
  [key: string]: {
    preview_value: string;
    preview_value_format: string[];
    name: string;
    value: string;
  }[];
}
export interface PrinterInventoryTransferResponseModel {
  html_content: string;
  id: number;
  size: string;
}

export type FormPrinterModel = "create" | "edit" | "view";

/**
 * print form by order ids response
 */
export type PrintFormByOrderIdsResponseModel = {
  html_content: string;
  order_id: number;
  size: string;
}[];

export interface PrinterResponse {
  html_content: string;
  id: number;
  size: string;
}
