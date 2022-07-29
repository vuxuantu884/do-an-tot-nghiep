import { BaseObject } from "model/base/base.response";
import { BaseQuery } from "../base/base.query";

export interface DepartmentResponse extends BaseObject {
  name: string;
  manager_code: string;
  manager: string;
  phone: string;
  status: string;
  address: string;
  level: number;
  parent_id: number;
  parent_name: string;
  department_id: number;
  parent: string;
  children: Array<DepartmentResponse>;
}

export interface DepartmentView extends BaseObject {
  name: string;
  level: number;
  manager_code: string;
  manager: string;
  phone: string;
  parent_name: string;
  address: string;
  isHaveChild?: boolean;
  parent: DepartmentParent | null;
}

export interface DepartmentFilterProps extends BaseQuery {
  content: string | null;
  status: string | null;
  department_ids: string | null;
}

export interface DepartmentRequest {
  code: string;
  name: string;
  phone: string;
  address: string;
  parent_id: string;
  manager_code: string;
  status: string;
}

export interface DepartmentParent {
  id: number;
  name: string;
}
