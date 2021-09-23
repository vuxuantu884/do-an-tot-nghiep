import { BaseQuery } from "../base/base.query";

export interface ProductEcommerceQuery extends BaseQuery {
  ecommerce_id: number | null;
  shop_id: number | null;
  category_id: string | null;
  connect_status: String | null;
  update_stock_status: String | null;
}
