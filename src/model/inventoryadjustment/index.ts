import { StoreResponse } from "model/core/store.model";
import { ProductResponse, VariantImage, VariantPricesResponse } from "model/product/product.model"; 

export interface InventoryAdjustmentSearchQuery {
  page: number;
  limit: number;
  condition: string | null, 
  adjusted_store_id: number | null,
  status: [],
  from_total_variant: number | null,
  to_total_variant: number | null,
  from_total_quantity: number | null,
  to_total_quantity: number | null,
  from_total_amount: number | null,
  to_total_amount: number | null,
  created_by: [],
  from_created_date: string|null,
  to_created_date: string|null,
  from_inventoryadjustment_date: string|null,
  to_inventoryadjustment_date: string|null,
}

export type StoreStatus = {
  simple?: boolean;
  status?: string;
  limit?: number;
  page?: number;
  info?: string;
  store_id?: number;
};

export type FileParam = {
  files: File[] | undefined;
  folder: string;
};


export interface LineItemAdjustment {
  id: number;
  code: string;
  version: number;
  created_by: string;
  created_name: string;
  created_date: Date;
  updated_by: string;
  updated_name: string;
  updated_date: Date;
  sku: string;
  name: string; 
  variant_id: number,
  variant_name: string;
  variant_images:Array<VariantImage>,
  variant_prices:Array<VariantPricesResponse>,
  product_name: string;
  product_id: number;
  product:ProductResponse,
  available:number|null,
  weight: number,
  weight_unit: string,
  amount: number;
  price: number;
  barcode: string;
  on_hand: number,
  real_on_hand: number,
  on_hand_adj: number,
  on_hand_adj_dis: string,
  
}

export interface FileUrl {
  id?: number;
  transfer_id?: number;
  url: string;
}
 
export interface InventoryAdjustmentDetailItem {
  id: number;
  code: string;
  version: number;
  created_by: string;
  created_name: string;
  created_date: Date;
  updated_by: string;
  audit_type: string;
  audit_name?: string;
  updated_name: string;
  updated_date: Date; 
  adjusted_store_id: number,
  adjusted_store_name: string | null,
  status: string;
  total_variant: number;
  total_quantity: number;
  total_amount: number;
  audited_by: [];
  attached_files: [];
  note: string; 
  audited_date: Date;
  adjusted_date: Date;
  finished_date: Date;
  adjusted_by: string;
  total_on_hand: number;
  total_real_on_hand: number;
  total_excess: number;
  total_missing: number;
  line_items: Array<LineItemAdjustment>;
  store: StoreResponse;
}; 

