import { BaseMetadata } from "model/base/base-metadata.response";

export interface BasePrinterModel {
  company: string;
  company_id: number;
  default: boolean;
  id?: number;
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
    name: string;
    value: string;
  }[];
}
