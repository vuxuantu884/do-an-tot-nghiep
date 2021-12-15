import { BaseObject } from "model/base/base.response";

export interface Department extends BaseObject {
  name: string,
  manager_code: string,
  manager: string,
  phone: string,
  address: string,
  parent_id: number,
  department_id: number,
  children: Array<DepartmentResponse>,
  code: string,
  status: string,
  level: number,
  parent: DepartmentParent | null | string
}

export interface DepartmentResponse extends Department {
  parent: string,
}

export interface DepartmentView extends Department {
}

export interface DepartmentRequest {
  code: string,
  name: string,
  phone: string,
  address: string,
  parent_id: string,
  manager_code: string,
  status: string,
}


export interface DepartmentParent {
  id: number,
  name: string,
}