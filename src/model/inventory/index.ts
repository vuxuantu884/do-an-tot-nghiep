import { BaseQuery } from "model/base/base.query";
import { BaseObject } from "model/base/base.response";


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
  onway: number | null;
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
}

export interface InventoryQuery extends BaseQuery {
  condition?: string,
  store_id?: number,
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
  from_import_price?: number,
  to_import_price?: number,
  from_mac?: number,
  to_mac?: number,
  from_retail_price?: number,
  to_retail_price?: number
} 