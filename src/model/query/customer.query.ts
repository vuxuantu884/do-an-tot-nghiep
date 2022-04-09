import { BaseQuery } from "../base/base.query";

export interface CustomerSearchQuery extends BaseQuery {
  ids?: Array<any> | [];
  search_type?: string | null;
  is_simple?:number|null;
  request?: string | null;
  gender?: string | null;
  customer_group_ids?: Array<any> | [];
  customer_level_ids?: Array<any> | [];
  responsible_staff_codes?: string | null;
  customer_type_ids?: Array<any> | [];
  assign_store_ids?: Array<any> | [];
  store_ids?: Array<any> | [];
  source_ids?: Array<any> | [];
  channel_ids?: Array<any> | [];
  day_of_birth_from?: number | undefined;
  day_of_birth_to?: number | undefined;
  month_of_birth_from?: number | undefined;
  month_of_birth_to?: number | undefined;
  year_of_birth_from?: number | undefined;
  year_of_birth_to?: number | undefined;
  age_from?: String | null;
  age_to?: String | null;
  city_ids?: Array<any> | [];
  district_ids?: Array<any> | [];
  ward_ids?: Array<any> | [];
  total_finished_order_from?: number | undefined;
  total_finished_order_to?: number | undefined;
  total_paid_amount_from?: number | undefined;
  total_paid_amount_to?: number | undefined;
  total_returned_order_from?: number | undefined;
  total_returned_order_to?: number | undefined;
  remain_amount_to_level_up_from?: number | undefined;
  remain_amount_to_level_up_to?: number | undefined;
  average_order_amount_from?: number | undefined;
  average_order_amount_to?: number | undefined;
  total_returned_amount_from?: number | undefined;
  total_returned_amount_to?: number | undefined;
  store_of_first_order_ids?: Array<any> | [];
  store_of_last_order_ids?: Array<any> | [];
  number_of_days_without_purchase_from?: number | undefined;
  number_of_days_without_purchase_to?: number | undefined;
  point_from?: number | undefined;
  point_to?: number | undefined;
  first_order_time_from?: String | null;
  first_order_time_to?: String | null;
  last_order_time_from?: String | null;
  last_order_time_to?: String | null;

  phone?: string | null;
  from_birthday?: String | null;
  to_birthday?: String | null;
  company?: string | null;
  from_wedding_date?: String | null;
  to_wedding_date?: String | null;
  customer_level_id?: number | undefined;
}

export interface FpageCustomerSearchQuery extends BaseQuery {
  request: "",
  phone: string | null
}

export interface ExportCustomerRequest {
  conditions?: string;
  fields?: Array<string> | null;
  type: string;
  url?: string
}
