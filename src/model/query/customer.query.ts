import { BaseQuery } from "../base/base.query";

export interface CustomerSearchQuery extends BaseQuery {
  request: string | null;
  gender: string | null;
  phone?: string | null;
  from_birthday: String | null;
  to_birthday: String | null;
  company: string | null;
  from_wedding_date: String | null;
  to_wedding_date: String | null;
  customer_type_id: number | null;
  customer_group_id: number | null;
  customer_level_id: number | null;
  responsible_staff_code: string | null;
}

export interface FpageCustomerSearchQuery extends BaseQuery {
  request: "",
  phone: string | null
}