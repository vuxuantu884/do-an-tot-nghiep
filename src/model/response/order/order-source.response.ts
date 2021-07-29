import { BaseMetadata } from "model/base/base-metadata.response";
import { BaseObject } from "model/base/base.response";

export interface OrderSourceModel  {
  company?: string,
  name?: string,
  company_id?: number,
  department?: string,
  department_id?: string,
  is_active: boolean,
  is_default: boolean,
}

export interface OrderSourceModelResponse  {
  items: OrderSourceModel[],
  metadata: BaseMetadata,
}

export interface OrderSourceCompanyModel extends BaseObject  {
  company_id: number,
  company: string,
  name: string,
}
