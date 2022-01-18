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
  update_time_from: number | null;
  update_time_to: number | null;
}

export interface ExitProgressDownloadEcommerceQuery {
  processId: number | null;
}

export interface GetOrdersMappingQuery extends BaseQuery {
  ecommerce_order_code: string | null;
  core_order_code: string | null;
  connected_status: string | null;
  created_date_from: number | null;
  created_date_to: number | null;
  ecommerce_order_statuses: Array<any> | null;
  shop_ids: Array<any> | null;
}

export interface RequestSyncStockQuery {
  sync_type: string | null;
  shop_ids: Array<number> | null;
  variant_ids: Array<number> | null;
}
