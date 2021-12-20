import { BaseQuery } from "model/base/base.query";
import { BaseObject } from "model/base/base.response";
import { ProductResponse } from "model/product/product.model";


export interface InventoryResponse extends BaseObject {
  name: string;
  sku: string;
  company_id: number;
  store_id: number;
  store_code: string;
  variant_id: number;
  product_id: number;
  on_hand: number;
  committed: number | null;
  available: number | null;
  in_coming: number | null;
  on_way: number | null;
  transaction_date: string;
  mac: string | null;
  barcode: string | null;
  total_stock: number;
  on_hold: number;
  defect: number;
  transferring: number;
  shipping: number;
  retail_price: number;
  import_price: number;
  product: ProductResponse | null
}

export interface InventoryQuery extends BaseQuery {
  condition?: string,
  store_id?: number|Array<number>,
  is_remain?: boolean,
  from_created_date?: string,
  to_created_date?: string,
  from_transaction_date?: string,
  to_transaction_date?: string,
  from_total_stock?: number,
  to_total_stock?: number,
  from_on_hand?: number,
  to_on_hand?: number,
  from_committed?: number,
  to_committed?: number,
  from_available?: number,
  to_available?: number,
  from_on_hold?: number,
  to_on_hold?: number,
  from_defect?: number,
  to_defect?: number,
  from_incoming?: number,
  to_incoming?: number,
  from_transferring?: number,
  to_transferring?: number,
  from_on_way?: number,
  to_on_way?: number,
  from_shipping?: number,
  to_shipping?: number,
  to_import_price?: number,
  from_mac?: number,
  to_mac?: number,
  from_retail_price?: number,
  to_retail_price?: number,
  variant_id?: number
  status?: string;
} 
export interface InventoryVariantListQuery extends InventoryQuery {
  variant_ids?: Array<number>;
  store_ids?: Array<number>;
  is_detail?: boolean;
}
export interface AllInventoryResponse {
  id: number,
  sku: string,
  product_id: number,
  barcode: string,
  name: string,
  retail_price: string,
  import_price: string,
  total_on_hand: string,
  total_available:number,
  inventories: Array<InventoryResponse>,
}

export interface HistoryInventoryResponse extends BaseObject{
  name: string;
  sku: string;
  company_id: number;
  store_id: number;
  store: string,
  variant_id: number;
  variant: string;
  product_id: number;
  available_adj: number;
  in_coming_adj: number | null;
  on_way_adj: number | null;
  event: string;
  parent_document_id: number;
  document_id: number;
  document_type: string;
  transaction_date: string;
  account_id: number;
  account: string|null;
  account_code: string|null;
  import_price: number;
  retail_price: number;
  total: number;
  total_discount: number;
}

export interface HistoryInventoryQuery extends BaseQuery {
  condition?: string,
  store_ids?: number|Array<number>|null,
  from_created_date?: string,
  to_created_date?: string,
  from_transaction_date?: string,
  to_transaction_date?: string,
  variant_id?: number
}

export interface InventorySaveRequest{
  filter_name?: string,
  save_filter_type?: number,
  version?: number,
  filter_id?:number|null
}

export interface AllInventoryQuery extends BaseQuery {
  info?: string,
  store_ids?: number|Array<number>|null, 
}