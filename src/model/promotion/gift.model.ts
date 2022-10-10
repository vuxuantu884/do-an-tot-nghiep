import { BaseObject } from "model/base/base.response";
import { BaseQuery } from "../base/base.query";
import React from "react";
import {
  CustomerSelectionOption, DiscountConditionRule,
  PrerequisiteSubtotalRange,
  WeekDays,
  DateDuration,
} from "model/promotion/price-rules.model";

//enum
/** 2 loại quà tặng */
export enum GIFT_METHOD_ENUM {
  QUANTITY = "QUANTITY", //Quà tặng theo sản phẩm
  ORDER_THRESHOLD = "ORDER_THRESHOLD", //Quà tặng theo đơn hàng
}

export enum GIFT_STATE_ENUM {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  DISABLED = "DISABLED",
  CANCELLED = "CANCELLED",
}

export const GIFT_METHOD_LIST = [
  {
    label: "Tặng quà theo sản phẩm",
    value: GIFT_METHOD_ENUM.QUANTITY,
  },
  {
    label: "Tặng quà theo đơn hàng",
    value: GIFT_METHOD_ENUM.ORDER_THRESHOLD,
  },
]

export interface GiftEntitlementForm {
  entitled_category_ids?: Array<number>;
  entitled_product_ids: Array<number>;
  entitled_gift_ids?: Array<number>;
  entitled_variant_ids: Array<number>;
  prerequisite_quantity_ranges: Array<EntitleRange>;
  prerequisite_variant_ids?: Array<number>;
  selectedProducts?: Array<GiftProductEntitlements>; // dùng trong local, không dùng để gửi lên server
  selectedGifts?: Array<GiftProductEntitlements>; // dùng trong local, không dùng để gửi lên server
}

export interface GiftVariant {
  //là variant phải có cả variant_id & product_id
  cost: number;
  entitlement: GiftEntitlementForm;
  is_gift: boolean;
  open_quantity: number;
  price_rule_id: number;
  product_id: number;
  retail_price: number;
  sku: string;
  title: string;
  variant_id: number;
  variant_title: string;
}

export interface GiftRule {
  group_operator: string;
  value: number;
  value_type: string;
  conditions: DiscountConditionRule[];
}

export interface GiftProductEntitlements {
  //là variant phải có cả variant_id & product_id
  limit?: number;
  cost: number;
  sku: string;
  variant_id?: number;
  product_id: number;
  variant_title: string | React.ReactNode;
  entitlement?: GiftEntitlementForm;
  open_quantity: number;
  price_rule_id?: number;
  retail_price?: number;
  title?: string;
}

export interface DataType {
  sku: string;
  variant_title: string | React.ReactNode;
  product_id: number | null;
  variant_id: number | null;
}

export interface EntitleRange {
  greater_than_or_equal_to: number | null;
}

export interface DiscountCode {
  id: number;
  code: string;
  price_rule_id: number;
  async_usage_count: 1;
  created_date: Date;
  disabled?: boolean;
  published?: boolean;
  remaining_count: number;
}

export interface PromotionGift extends BaseObject {
  activated?: boolean;
  activated_by: string;
  activated_date?: Date;
  activated_name: string;
  async_allocation_count?: number;
  async_usage_count: number;
  cancelled_by?: string;
  cancelled_date?: Date;
  cancelled_name?: string;
  code: string;
  customer_selection?: CustomerSelectionOption;
  description?: string;
  disabled_by?: string;
  disabled_date?: Date;
  disabled_name?: string;
  discount_codes?: DiscountCode[]; // TODO: need to remove
  ends_date?: Date;
  ends_birthday?: Date;
  ends_wedding_day?: Date;
  entitled_method: GIFT_METHOD_ENUM;
  entitlements: GiftEntitlementForm[];
  number_of_discount_codes: number;
  number_of_entitlements: number;
  prerequisite_assignee_codes?: Array<string>;
  prerequisite_birthday_duration?: DateDuration;
  prerequisite_customer_group_ids?: Array<number>;
  prerequisite_customer_loyalty_level_ids?: Array<number>;
  prerequisite_customer_type_ids?: Array<number>;
  prerequisite_genders?: Array<string>;
  prerequisite_order_source_ids?: number[];
  prerequisite_sales_channel_names?: string[];
  prerequisite_store_ids?: number[];
  prerequisite_subtotal_range?: PrerequisiteSubtotalRange;
  prerequisite_time_duration?: DateDuration;
  prerequisite_total_finished_order_from?: number;
  prerequisite_total_finished_order_to?: number;
  prerequisite_total_money_spend_from?: number;
  prerequisite_total_money_spend_to?: number;
  prerequisite_wedding_duration?: DateDuration;
  prerequisite_weekdays?: Array<WeekDays>;
  priority: number;
  quantity_limit?: number;
  rule?: GiftRule;
  starts_date?: Date;
  starts_birthday?: Date;
  starts_wedding_day?: Date;
  state?: GIFT_STATE_ENUM;
  title: string;
  total_usage_count?: number;
  type?: string;
  usage_limit?: number;
  usage_limit_per_customer?: number;
}

export interface GiftSearchQuery extends BaseQuery {
  type?: string;
  request?: string | null;
  query?: string | null;
  variant_id?: string | null;
  product_id?: string | null;
  states?: Array<any> | [];
  priorities?: Array<number> | [];
  entitled_methods?: Array<any> | [];
  creators?: Array<string> | [];
  store_ids?: Array<any> | [];
  channels?: Array<any> | [];
  source_ids?: Array<number> | [];
  starts_date_min?: string | null;
  starts_date_max?: string | null;
  ends_date_min?: string | null;
  ends_date_max?: string | null;
  status?: Array<any> | [];
  created_date?: Array<any> | [];
  from_created_date?: string | null;
  to_created_date?: string | null;
  state?: string | null;
  use_status?: string | null;
  applied_shop?: any;
  applied_source?: Array<any> | [];
  customer_category?: Array<any> | [];
  discount_method?: Array<any> | [];
}
