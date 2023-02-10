import { BaseQuery } from "model/base/base.query";

export interface PromotionCampaignQuery extends BaseQuery {
  request?: string | null;
  starts_date?: string | null;
  ends_date?: string | null;
}

export interface PromotionCampaignResponse {
  name: string;
  description: string;
  price_rule_ids: Array<number>;
  price_rules: Array<any>;
  created_by: string;
  created_name: string;
  created_date: Date;
  updated_by: string;
  updated_name: string;
  updated_date: Date;
  id: number;
  code: string;
  starts_date: Date;
  ends_date: Date;
  state: string;
}
