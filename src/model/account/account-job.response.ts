import { BaseObject } from "model/response/base.response";

export interface AccountJobResponse extends BaseObject {
  position_id: number,
  position_name: string,
  department_id: number,
  department_name: string,
  store_name: string,
  account_id: number,
  manager_id: number,
  manager_name: string,
}