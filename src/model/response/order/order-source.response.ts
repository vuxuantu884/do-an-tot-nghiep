import { BaseObject } from "model/base/base.response";

export interface OrderSourceModel  {
  company?: string,
  company_id?: number,
  department?: string,
  department_id?: string,
  is_active: boolean,
  is_default: boolean,
}