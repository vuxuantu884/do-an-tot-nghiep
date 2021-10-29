import { BaseObject } from "model/base/base.response";

export interface DepartmentResponse extends BaseObject {
  name:string,
  manager_code: string,
  manager: string,
  mobile: string,
  address: string,
  parent_id: number,
  children: Array<DepartmentResponse>,
}

export interface DepartmentRequest {
  code: string,
  name: string,
  mobile: string,
  address: string,
  parent_id: string,
  manager_code: string,
}