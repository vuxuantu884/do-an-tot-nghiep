import { BaseObject } from "model/base/base.response";

export interface ListDiscountResponse extends BaseObject {
  id: number;
  code: string;
  name: string;
  start_time: string;
  end_time: string;
  created_by: string;
  status: string;
}