import {
  DiscountRule,
  EntilementFormModel,
  WeekDays,
} from "model/promotion/discount.create.model";
import {
  DateDuration,
  PrerequisiteSubtotalRange,
} from "model/response/promotion/discount/list-discount.response";

export interface PriceRuleFormRequest {
  title: string;
  description: string;
  priority: number;
  usage_limit?: number;
  usage_limit_per_customer?: number;
  quantity_limit?: number;
  starts_date: string;
  ends_date?: string;
  prerequisite_time_duration: DateDuration;
  prerequisite_weekdays: Array<WeekDays>;
  prerequisite_days: Array<number>;
  prerequisite_genders: Array<string>;
  prerequisite_customer_group_ids?: Array<number>;
  prerequisite_customer_loyalty_level_ids?: Array<number>;
  prerequisite_customer_type_ids: Array<number>;
  prerequisite_birthday_duration?: DateDuration;
  prerequisite_wedding_duration?: DateDuration;
  prerequisite_store_ids: number[];
  prerequisite_sales_channel_names: string[];
  prerequisite_order_source_ids: number[];
  prerequisite_assignee_codes?: Array<string>;
  prerequisite_subtotal_range: PrerequisiteSubtotalRange;
  entitled_method: string;
  entitlements: EntilementFormModel[];
  discount_codes: any[];
  rule?: DiscountRule;
  activated: boolean;
}
