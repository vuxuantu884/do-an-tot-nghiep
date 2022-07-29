import { BaseQuery } from "../base/base.query";

export interface DiscountSearchQuery extends BaseQuery {
  type: string;
  request?: string | null;
  query?: string | null;
  variant_id?: string | null;
  product_id?: string | null;
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
