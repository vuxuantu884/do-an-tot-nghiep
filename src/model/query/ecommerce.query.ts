import { BaseQuery } from "../base/base.query";

export interface ProductEcommerceQuery extends BaseQuery {
  ecommerce_id: number | null;
  shop_ids: Array<any> | null;
  connect_status: String | null;
  update_stock_status: String | null;
  sku_or_name_ecommerce: String | null;
  sku_or_name_core: String | null;
  connected_date_from: any | null;
  connected_date_to: any | null;
}

export interface PostProductEcommerceQuery {
  ecommerce_id: number | null;
  shop_id: number | null;
  update_time_from: number | null;
  update_time_to: number | null;
}

export interface PostEcommerceOrderQuery {
  ecommerce_id: number | null;
  shop_id: number | null;
  create_time_from: number | null;
  create_time_to: number | null;
}

export interface GetOrdersMappingQuery extends BaseQuery {
  search_term: string | null;
  connect_status: string | null;
  issued_on_min: number | null;
  issued_on_max: number | null;
  order_status: Array<any> | null;

  //remove later
  channel_id: number | undefined;
  source_ids: Array<any> | null;
}
