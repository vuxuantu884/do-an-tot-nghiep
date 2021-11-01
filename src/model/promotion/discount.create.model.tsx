export interface DiscountCreateModel {
  title: string;
  description: string | null;
  priority: number | 1;
  usage_limit: number | null;
  starts_at: string;
  ends_at: string | null;
  prerequisite_duration: PrerequisiteDuration;
  prerequisite_weekdays: Array<string> | [];
  prerequisite_days: Array<number> | [];
  prerequisite_store_ids: Array<number> | [];
  prerequisite_sales_channel_names: Array<string> | [];
  prerequisite_order_sources_ids: Array<number> | [];
  customer_selection: boolean | false;
  prerequisite_gender: Array<string> | [];
  prerequisite_customer_group_ids: Array<number> | [];
  prerequisite_customer_level_ids: Array<number> | [];
  prerequisite_customer_type_ids: Array<number> | [];
  prerequisite_assigned_user_ids: Array<number> | [];
  prerequisite_customer_birthday: PrerequisiteDuration;
  prerequisite_customer_marriage_day: PrerequisiteDuration;
  entitled_method: string;
  disabled: boolean | true;
  discount_codes: Array<number> | [];
  entitlements: Array<Entitlement> | [];
}

export interface PrerequisiteDuration {
  starts_time: string;
  ends_time: string | null;
}

export interface Entitlement {
  entitled_product_ids: Array<number> | [];
  entitled_variant_ids: Array<number> | [];
  entitled_category_ids: Array<number> | [];
  prerequisite_quantity_range: EntitleRange | [];
  prerequisite_subtotal_range: EntitleRange | [];
  allocation_limit: number | null;
  value_type: string | null;
  value: number | null;
}

export interface EntitleRange {
  greater_than_or_equal_to: number | null;
  less_than_or_equal_to: number | null;
}
