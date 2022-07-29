import { BaseObject } from "model/base/base.response";
import {
  LoyaltyProgramRuleItem,
  LoyaltyProgramRuleProductItem,
} from "model/request/loyalty/create-loyalty-accumulation.request";

export interface LoyaltyAccumulationProgramResponse extends BaseObject {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  note: string;
  not_using_point: boolean;
  having_card: boolean;
  priority: number;
  stores: Array<LoyaltyProgramRuleItem>;
  channels: Array<LoyaltyProgramRuleItem>;
  sources: Array<LoyaltyProgramRuleItem>;
  items: Array<LoyaltyProgramRuleProductItem>;
  status: string;
  rules: Array<LoyaltyProgramRuleResponse>;
}

export interface LoyaltyProgramRuleResponse {
  id: number;
  order_amount_min: number;
  order_amount_max: number;
  customer_group_id: number;
  customer_ranking_id: number;
  customer_type_id: number;
  percent: number;
}
