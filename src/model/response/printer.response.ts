import { BaseMetadata } from "model/base/base-metadata.response";
import { BaseObject } from "model/base/base.response";

export interface PrinterModel {
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

export interface PrinterResponseModel {
  items: PrinterModel[];
  metadata: BaseMetadata;
}

export interface SinglePrinterResponseModel {
  items: PrinterModel[];
  metadata: BaseMetadata;
}
