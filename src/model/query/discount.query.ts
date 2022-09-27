import { BaseQuery } from "../base/base.query";

export interface DiscountSearchQuery extends BaseQuery {
  type?: string;
  request?: string | null;
  query?: string | null;
  variant_id?: string | null;
  product_id?: string | null;
  states?: Array<any> | [];
  priorities?: Array<number> | [];
  entitled_methods?: Array<any> | [];
  creators?: Array<string> | [];
  store_ids?: Array<any> | [];
  channels?: Array<any> | [];
  source_ids?: Array<number> | [];
  starts_date_min?: string | null;
  starts_date_max?: string | null;
  ends_date_min?: string | null;
  ends_date_max?: string | null;
  status?: Array<any> | [];
  created_date?: Array<any> | [];
  from_created_date?: string | null;
  to_created_date?: string | null;
  state?: string | null;
  use_status?: string | null;
  applied_shop?: any;
  applied_source?: Array<any> | [];
  customer_category?: Array<any> | [];
  discount_method?: Array<any> | [];
}
