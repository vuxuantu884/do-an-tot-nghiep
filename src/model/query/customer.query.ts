import { BaseQuery } from "../base/base.query";

export interface CustomerSearchQuery extends BaseQuery {
  is_simple?:number|null;
  request: string | null;
  gender: string | null;
  customer_group_id: number | undefined;
  customer_level_ids?: Array<any> | [];
  responsible_staff_code: string | null;
  customer_type_id: number | undefined;
  card_issuer?: String | null;
  store_ids?: Array<any> | [];
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
  total_order_from?: number | undefined;
  total_order_to?: number | undefined;
  accumulated_amount_from?: number | undefined;
  accumulated_amount_to?: number | undefined;
  total_refunded_order_from?: number | undefined;
  total_refunded_order_to?: number | undefined;
  remain_amount_from?: number | undefined;
  remain_amount_to?: number | undefined;
  average_order_amount_from?: number | undefined;
  average_order_amount_to?: number | undefined;
  total_refunded_amount_from?: number | undefined;
  total_refunded_amount_to?: number | undefined;
  first_order_store_ids?: Array<any> | [];
  last_order_store_ids?: Array<any> | [];
  days_without_purchase_from?: number | undefined;
  days_without_purchase_to?: number | undefined;
  first_order_date_from?: String | null;
  first_order_date_to?: String | null;
  last_order_date_from?: String | null;
  last_order_date_to?: String | null;

  phone?: string | null;
  from_birthday: String | null;
  to_birthday: String | null;
  company: string | null;
  from_wedding_date: String | null;
  to_wedding_date: String | null;
  customer_level_id: number | undefined;
}

export interface FpageCustomerSearchQuery extends BaseQuery {
  request: "",
  phone: string | null
}