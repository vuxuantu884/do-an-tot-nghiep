import { SupplierResponse } from 'model/core/supplier.model';
import { BaseQuery } from "model/base/base.query";
import { BaseObject } from "model/base/base.response";

export interface MaterialQuery extends BaseQuery {
  component?: string,
  created_name?: string,
  description?: string,
  info?: string,
  sort_column?: string,
  sort_type?: string
}

export interface MaterialCreateRequest {
  code: string,
  component: string,
  description: string,
  name: string,
  advantages: string,
  defect: string,
  preserve: string,
  status: string,
  fabric_size_unit: string,
  weight_unit: string,
  price_unit: string,
  application: string,
  images: Array<string>,
  videos: Array<string>,
  care_labels: string,
  fabric_code: string,
}

export interface MaterialUpdateRequest extends MaterialCreateRequest {
  version: number,
  supplier_ids: Array<number>,
}

export interface MaterialUpdateStatusAndNoteRequest {
  status: string,
  description: string,
}

export interface MaterialResponse extends BaseObject {
  name: string,
  component: string,
  description: string,
  advantages: string,
  defect: string,
  preserve: string,
  weight: string,
  weight_unit: string,
  fabric_size: number,
  fabric_size_unit: string,
  price: number,
  price_unit: string,
  application: string,
  status: string,
  fabric_code: string,
  supplier_ids: Array<number>,
  suppliers: Array<SupplierResponse>,
  care_labels: string,
  images: Array<string>,
  videos: Array<string>,
  version: number
}
