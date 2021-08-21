import { BaseQuery } from "../base/base.query";

export interface CustomerSearchQuery extends BaseQuery {
  request?: string;
  gender?: string;
  from_birthday: Date | "";
  to_birthday: Date | "";
  company: string;
  from_wedding_date: Date | "";
  to_wedding_date: Date | "";
  customer_type_id: number | null;
  customer_group_id: number | null;
  customer_level_id: number | null;
  responsible_staff_code: "";
}
