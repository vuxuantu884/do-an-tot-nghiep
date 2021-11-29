import { BaseObject } from "model/base/base.response";

export interface PromoCodeResponse extends BaseObject {
  id: number;
  code: string;
  price_rule_id: number;
  usage_count: number;
}
