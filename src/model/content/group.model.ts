import { BaseObject } from "model/base/base.response";

export interface GroupResponse extends BaseObject {
  name: string;
  company_id: number;
}
