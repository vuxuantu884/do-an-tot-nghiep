import { BaseQuery } from "../base/base.query";

export interface DiscountSearchQuery extends BaseQuery {
  type: string;
  request?: string | null;
  from_created_date?: string | null;
  to_created_date?: string | null;
  status?: string | null,
  applied_shop?: string | null,
  applied_source?: string | null,
  customer_category?: string | null,
  discount_method?: string | null
}
