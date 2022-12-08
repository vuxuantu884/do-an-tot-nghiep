import { CreateAcumulationPoints } from "screens/promotion/loyalty/accumulate";

export interface CreateLoyaltyAccumulationRequest {
  name: string;
  start_time: string | null;
  end_time: string | null;
  note: string | null;
  not_using_point: boolean;
  having_card: boolean;
  priority: number;
  stores: Array<LoyaltyProgramRuleItem> | null;
  channels: Array<LoyaltyProgramRuleItem> | null;
  sources: Array<LoyaltyProgramRuleItem> | null;
  items: Array<LoyaltyProgramRuleItem> | null;
  status: string;
  rules: Array<LoyaltyProgramRuleRequest>;
}

export interface LoyaltyProgramRuleRequest {
  order_amount: CreateAcumulationPoints;
  total_money_spend: CreateAcumulationPoints;
  total_order_count: CreateAcumulationPoints;
  customer_group_id: number | null;
  customer_ranking_id: number | null;
  customer_type_id: number | null;
  percent: number;
}

export interface LoyaltyProgramRuleItem {
  id: number;
  name: string;
  code: string;
}

export interface LoyaltyProgramRuleProductItem {
  id: number;
  name: string;
  sku: string;
  code: string;
}
