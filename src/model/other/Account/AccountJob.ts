import { BaseModel } from "../BaseModel";

export interface AccountJob extends BaseModel {
  position_id: number;
  position_name: string;
  department_id: number;
  department_name: string;
  manager_id: string;
  manager_name: string;
}