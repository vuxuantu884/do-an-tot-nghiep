import { BaseObject } from "model/base/base.response";

//enum
/**
 * 3 phương thức chiết khấu
 */
export enum PriceRuleMethod {
  FIXED_PRICE = "FIXED_PRICE", // Đồng giá
  QUANTITY = "QUANTITY", // Chiết khấu theo từng sản phẩm
  ORDER_THRESHOLD = "ORDER_THRESHOLD", // Chiết khấu theo đơn hàng
}

export enum PriceRuleType {
  AUTOMATIC= "AUTOMATIC", // Tự động
  MANUAL = "MANUAL", // Thủ công
}

export enum PriceRuleState {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  DISABLED = "DISABLED",
  CANCELLED = "CANCELLED",
}
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum CustomerSelectionOption {
  ALL = "ALL",
  PREREQUISITE = "PREREQUISITE",
}

/**
 *Dùng trong điều kiện khuyến mãi theo thời gian
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


// interface

export interface PrerequisiteSubtotalRange {
  greater_than_or_equal_to: number;
  less_than_or_equal_to: number;
}

export interface PrerequisiteDuration {
  starts_time: string;
  ends_time: string | null;
}

/**
 * Sản phẩm thêm từ file import
 */
export interface VariantEntitlementsFileImport {
  discount_type: PriceRuleMethod;
  discount_value: number;
  index: number;
  limit: number;
  min_quantity: number;
  price: number;
  product_code?: string;
  product_id: number;
  quantity: number;
  sku: string;
  variant_id: number;
  variant_title: string;
}

/**
 *Dùng trong chiết khấu theo đơn hàng
 */
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

export interface DateDuration {
  starts_mmdd_key?: number;
  ends_mmdd_key?: number;
  starts_day?: number;
  ends_day?: number;
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
  retail_price?: number;
  title?: string;
}

export interface EntilementFormModel {
  entitled_category_ids?: Array<number>;
  entitled_product_ids: Array<number>;
  entitled_variant_ids: Array<number>;
  prerequisite_quantity_ranges: Array<EntitleRange>;
  prerequisite_variant_ids?: Array<number>;
  selectedProducts?: Array<ProductEntitlements>;// dùng trong local, không dùng để gửi lên server
}

export interface EntitleRange {
  greater_than_or_equal_to: number | null;
  less_than_or_equal_to?: number | null;
  allocation_limit?: number;
  value_type?: string;
  value?: number;
}

/**
 * Dùng để thông báo số lượng sản phẩm bị bỏ qua khi import file chiết khấu
 */
export type IgnoreVariant = {
  ignoreVariantId: number;
  ignoreVariantSku: string;
};


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

export interface PriceRule extends BaseObject {
  activated_by: string;
  activated_date: Date;
  activated_name: string;
  async_allocation_count?: number;
  async_usage_count: number;
  cancelled_by?: string;
  cancelled_date?: Date;
  cancelled_name?: string;
  code: string;
  customer_selection: CustomerSelectionOption;
  description?: string;
  disabled_by?: string;
  disabled_date?: Date;
  disabled_name?: string;
  discount_codes?: DiscountCode[]; // TODO: need to remove
  ends_date?: Date;
  entitled_method: PriceRuleMethod;
  entitlements: EntilementFormModel[];
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
  prerequisite_wedding_duration?: DateDuration;
  prerequisite_weekdays?: Array<WeekDays>;
  priority: number;
  quantity_limit?: number;
  rule?: DiscountRule;
  starts_date: Date;
  state: PriceRuleState;
  title: string;
  total_usage_count?: number;
  type: PriceRuleType;
  usage_limit?: number;
  usage_limit_per_customer?: number;
}

