import { BaseQuery } from "../base/base.query";

export interface CustomerSearchQuery extends BaseQuery {
  request: string | null;
  gender: string | null;
  from_birthday: Date | null;
  to_birthday: Date | null;
  company: string | null;
  from_wedding_date: Date | null;
  to_wedding_date: Date | null;
  customer_type_id: number | null;
  customer_group_id: number | null;
  customer_level_id: number | null;
  responsible_staff_code: string | null;
}
