import { BaseObject } from "model/base/base.response";

export interface DepartmentResponse extends BaseObject {
  id: number;
  manager: null;
  manager_code: string | null;
  mobile: string;
  name: string;
  parent: number;
  parent_id: number;
}