import { BaseQuery } from "../base/base.query";

export interface WebAppProductQuery extends BaseQuery {
  ecommerce_id: number | null;
  shop_ids: Array<any> | null;
  connect_status: String | null;
  update_stock_status: String | null;
  sku_or_name_ecommerce: String | null;
  sku_or_name_core: String | null;
  connected_date_from: any | null;
  connected_date_to: any | null;
  suggest?: String | null;
}

export interface WebAppPostProductQuery {
  ecommerce_id: number | null;
  shop_id: number | null;
  update_time_from: number | null;
  update_time_to: number | null;
}

export interface WebAppPostOrderQuery {
  ecommerce_id: number | null;
  shop_id: number | null;
  update_time_from: number | null;
  update_time_to: number | null;
}

export interface WebAppDownloadOrderQuery {
  shop_id: number | null;
  update_time_from: number | null;
  update_time_to: number | null;
}

export interface WebAppExitProgressDownloadQuery {
  processId: number | null;
}

export interface WebAppGetOrdersMappingQuery extends BaseQuery {
  ecommerce_id: number | null;
  ecommerce_order_code: string | null;
  core_order_code: string | null;
  connected_status: string | null;
  created_date_from: number | null;
  created_date_to: number | null;
  ecommerce_order_statuses: Array<any> | null;
  shop_ids: Array<any> | [];
}

export interface WebAppRequestSyncStockQuery {
  sync_type: string | null;
  shop_ids: Array<number> | null;
  variant_ids: Array<number> | null;
}

export interface WebAppRequestExportExcelQuery extends WebAppProductQuery {
  category_id: number | null;
  core_variant_id: any;
  variant_ids: Array<number> | null;
}

export interface WebAppShopInventoryDto {
  store: String; //
  store_id: Number;
  deleted?: Boolean;
}

export interface WebAppConfigRequest {
  created_by: number | null;
  created_name: string | null;
  updated_by: number | null;
  updated_name: string | null;
  request_id: string | null;
  operator_kc_id: string | null;
  name: String;
  store_id: number;
  store: String;
  assign_account_code: String;
  assign_account: String;
  status: String;
  inventory_sync: boolean;
  order_sync: boolean;
  product_sync: String;
  inventories: Array<WebAppShopInventoryDto>;
  source: String;
  source_id: number;
}
export interface WebAppCreateShopifyRequest {
  id: number;
  ecommerce_shop: string;
  website: string;
  name: string;
  inventorySync: string;
}

