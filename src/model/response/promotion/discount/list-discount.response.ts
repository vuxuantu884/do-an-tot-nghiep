import { BaseObject } from "model/base/base.response";

export interface DiscountResponse extends BaseObject {
  disabled: boolean;
  description: string;
  discount_codes: any[];
  ends_date: string;
  entitled_method: string;
  id: number;
  number_of_discount_codes: number;
  number_of_entitlements: number
  priority: number;
  starts_date: string;
  title: string;
  type: string;
  usage_limit: number;
  usage_limit_per_customer: number;
  code: string;
  created_by: string;
  status: string;
  prerequisite_store_ids: number[];
  prerequisite_sales_channel_names: string[];
  prerequisite_order_source_ids: number[];
}
