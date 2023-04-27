import { BaseQuery } from "model/base/base.query";

export interface PromotionCampaignQuery extends BaseQuery {
  request?: string | null;
  states?: Array<string> | [];
  starts_date?: string | null;
  ends_date?: string | null;
}

export interface PromotionCampaignResponse {
  name: string;
  description: string;
  note: string;
  is_registered: boolean;
  is_accountant_confirmed: boolean;
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
  customer_selection: string;
  prerequisite_birthday_duration?: Array<string>;
  prerequisite_wedding_duration?: Array<string>;
  prerequisite_customer_group_ids?: Array<number>;
  prerequisite_customer_loyalty_level_ids?: Array<number>;
  prerequisite_customer_type_ids?: Array<number>;
  prerequisite_genders?: Array<string>;
  prerequisite_order_source_ids?: Array<number>;
  prerequisite_sales_channel_names?: Array<string>;
  prerequisite_store_ids?: Array<number>;
}

export interface UpdatePromotionCampaignStatusRequest {
  updated_by: string;
  updated_name: string;
}

export interface RegisterPromotionCampaignRequest extends UpdatePromotionCampaignStatusRequest {
  is_registered: boolean;
}

export interface AccountantConfirmRegisterRequest {
  is_accountant_confirmed: boolean;
}

export interface PromotionCampaignLogsResponse {
  account_code: string;
  account_name: string;
  event_date: string;
  event_name: string;
}
