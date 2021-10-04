import { BaseQuery } from "../base/base.query";

export interface ProductEcommerceQuery extends BaseQuery {
  ecommerce_id: number | null;
  shop_ids: Array<any> | null;
  category_id: string | null;
  connect_status: String | null;
  update_stock_status: String | null;
  sku_or_name_ecommerce: String | null;
  sku_or_name_core: String | null;
}

export interface PostProductEcommerceQuery {
  ecommerce_id: number | null;
  shop_id: number | null;
  update_time_from: number | null;
  update_time_to: number | null;
}
