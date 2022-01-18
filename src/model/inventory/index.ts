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
  product: ProductResponse | null,
}

export interface InventoryQuery extends BaseQuery {
  condition?: string,
  store_id?: number|Array<number>, 
  variant_id?: number,
  status?: string,
  store_adj?: number;
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


export interface AllInventoryQuery extends BaseQuery {
  info?: string,
  store_ids?: number|Array<number>|null, 
}