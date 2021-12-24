export enum DiscountMethod {
  FIXED_PRICE = "FIXED_PRICE", // Đồng giá
  QUANTITY = "QUANTITY", // Chiết khấu theo từng sản phẩm
  ORDER_THRESHOLD = "ORDER_THRESHOLD", // Chiết khấu theo đơn hàng
}
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
  prerequisite_order_source_ids: Array<number> | [];
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



export interface VariantEntitlementsFileImport {
  discount_type: DiscountMethod;
  discount_value: number;
  index: number;
  limit: number;
  min_quantity: number;
  price: number;
  product_code? : string;
  product_id: number;
  quantity: number;
  sku: string;
  variant_id: number;
  variant_title: string;
}

export interface DiscountFormModel {
  variants: Array<VariantEntitlementsFileImport>;
  entitled_variant_ids: Array<number>;
  "prerequisite_quantity_ranges.allocation_limit": number,
  "prerequisite_quantity_ranges.greater_than_or_equal_to": number,
  "prerequisite_quantity_ranges.value_type": "FIXED_PRICE" | "FIXED_AMOUNT" | string,
  "prerequisite_quantity_ranges.value": number,
}

export interface VariantPriceRule {
  cost: number;
  open_quantity: number;
  price_rule_id: number;
  product_id: number[];
  sku: string;
  title: string;
  variant_id: number[];
  variant_title: string;
}

export interface DiscountConditionRule {
  field: string;
  operator: string;
  value: string;
}

export interface DiscountRule {
  group_operator: string;
  value: number;
  value_type: string;
  conditions: DiscountConditionRule[];
}


/**
 * refactor
 */

export enum WeekDays {
  SUN = "SUN",
  MON = "MON",
  TUE = "TUE",
  WED = "WED",
  THU = "THU",
  FRI = "FRI",
  SAT = "SAT",
}

export interface ProductEntitlements {
  //là variant phải có cả variant_id & product_id
  limit?: number;
  cost: number;
  sku: string;
  variant_id?: number;
  product_id: number;
  variant_title: string | React.ReactNode;
  entitlement?: EntilementFormModel;
  open_quantity: number;
  price_rule_id?: number; 
}
export interface EntilementFormModel {
  entitled_category_ids?: Array<number>;
  entitled_product_ids: Array<number>;
  entitled_variant_ids: Array<number>;
  prerequisite_quantity_ranges: Array<EntitleRange>;
  prerequisite_variant_ids?: Array<number>;
  selectedProducts?: Array<ProductEntitlements>;
}

export interface EntitleRange {
  greater_than_or_equal_to: number | null;
  less_than_or_equal_to?: number | null;
  allocation_limit?: number;
  value_type?: string;
  value?: number;
}

export type IgnoreVariant = {
  ignoreVariantId: number;
  ignoreVariantSku: string;
};