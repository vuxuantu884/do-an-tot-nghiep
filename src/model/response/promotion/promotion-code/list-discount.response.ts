import { BaseObject } from "model/base/base.response";

export interface ListPromotionCodeResponse extends BaseObject {
  id: number;
  code: string;
  name: string;
  code_amount: string;
  used_amount: string;
  start_time: string;
  end_time: string;
  created_by: string;
  status: string;
}