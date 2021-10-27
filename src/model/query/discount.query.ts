import { BaseQuery } from "../base/base.query";

export interface DiscountSearchQuery extends BaseQuery {
  request: string | null;
  from_created_date: string | null;
  to_created_date: string | null;
  status: string | null,
  applied_shop: String | null,
  applied_source: String | null,
  customer_category: string | null,
  discount_method: String | null
}
