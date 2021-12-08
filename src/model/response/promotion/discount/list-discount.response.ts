import {BaseObject} from "model/base/base.response";

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum CustomerSelectionOption {
  ALL = "ALL",
  PREREQUISITE = "PREREQUISITE",
}
export interface DateDuration {
  starts_mmdd_key?: number;
  ends_mmdd_key?: number;
  starts_day?: number;
  ends_day?: number;
}
export interface DiscountResponse extends BaseObject {
  disabled: boolean;
  description: string;
  discount_codes: any[];
  ends_date: string;
  entitled_method: string;
  entitlements: any[];
  id: number;
  number_of_discount_codes: number;
  number_of_entitlements: number;
  priority: number;
  starts_date: string;
  title: string;
  type: string;
  usage_limit: number;
  usage_limit_per_customer: number;
  code: string;
  created_by: string;
  state: string;
  prerequisite_store_ids: number[];
  prerequisite_sales_channel_names: string[];
  prerequisite_order_source_ids: number[];
  total_usage_count: number;
  prerequisite_subtotal_range: PrerequisiteSubtotalRange;
  async_allocation_count?: number;
  customer_selection: CustomerSelectionOption;
  prerequisite_genders?: Array<string>;
  prerequisite_birthday_duration?: DateDuration;
  prerequisite_wedding_duration?: DateDuration;
  prerequisite_customer_group_ids?: Array<number>;
  prerequisite_customer_loyalty_level_ids?: Array<number>;
  prerequisite_assignee_codes?: Array<string>;
}

export interface PrerequisiteSubtotalRange {
  greater_than_or_equal_to: number;
  less_than_or_equal_to: number;
}

export interface DiscountVariantResponse {
  cost: number;
  open_quantity: number;
  price_rule_id: number;
  product_id: number;
  sku: string;
  title: string;
  variant_id: number;
  variant_title: string;
}
