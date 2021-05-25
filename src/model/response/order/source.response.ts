import { BaseObject } from "../base.response";

export interface SourceResponse extends BaseObject {
  name: string,
  reference_url: string | null;
  department_id: number | null;
  department: string | null;
}