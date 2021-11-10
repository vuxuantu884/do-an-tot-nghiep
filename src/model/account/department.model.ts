import { BaseObject } from "model/base/base.response";

export interface DepartmentResponse extends BaseObject {
  name: string,
  manager_code: string,
  manager: string,
  mobile: string,
  address: string,
  parent_id: number,
  parent: string,
  children: Array<DepartmentResponse>,
}

export interface DepartmentView extends BaseObject {
  name: string,
  level: number,
  manager_code: string,
  manager: string,
  mobile: string,
  address: string,
  parent: DepartmentParent | null
}

export interface DepartmentRequest {
  code: string,
  name: string,
  mobile: string,
  address: string,
  parent_id: string,
  manager_code: string,
}


export interface DepartmentParent {
  id: number,
  name: string,
}