import { SupplierResponse } from "model/core/supplier.model";
import { BaseQuery } from "model/base/base.query";
import { BaseObject } from "model/base/base.response";
import { CollectionResponse } from "./collection.model";

export interface ProductParams {
  id: string;
  variantId: string;
}

export interface VariantImage {
  id?: number;
  variant_id?: number;
  position: number | null;
  image_id: number;
  url: string;
  variant_avatar: boolean;
  product_avatar: boolean;
}

export interface VariantPricesResponse {
  id: number;
  price_type: string;
  import_price: number;
  wholesale_price: number;
  cost_price: number;
  variant_id: number;
  currency_code: string;
  currency_symbol: string;
  retail_price: number;
  tax_percent: number;
  [key: string]: any;
}

export interface ProductResponse extends BaseObject {
  name: string;
  category_id: number;
  category: string;
  material_id: number;
  material: string;
  goods: string;
  goods_name: string;
  brand: string;
  brand_name: string;
  made_in_id: number;
  made_in: string;
  description: string;
  content: string;
  merchandiser_code: string;
  merchandiser: string;
  designer_code: string;
  designer: string;
  tags: string | null;
  status: string;
  status_name: string;
  care_labels: string;
  unit: string;
  unit_name: string;
  product_type: string;
  code: string;
  specifications: string;
  variants: Array<VariantResponse>;
  on_hand: number;
  collections: Array<CollectionResponse>;
  product_collections: Array<string>;
  component: string | null;
  advantages: string | null;
  defect: string | null;
  material_component: string | null;
  material_advantages: string | null;
  material_defect: string | null;
  num_variant?: number;
}

export interface ProductWrapperResponse extends BaseObject {
  id: number;
  name: string;
  category_id: number;
  category: string;
  material_id: number;
  material: string;
  goods: string;
  brand: string;
  brand_name: string;
  made_in_id: number;
  made_in: string;
  description: string;
  content: string;
  merchandiser_code: string;
  merchandiser: string;
  designer_code: string;
  designer: string;
  tags: string | null;
  status: string;
  status_name: string;
  care_labels: string;
  unit: string;
  product_type: string;
  collections: Array<CollectionResponse>;
  specifications: string;
  variants: Array<VariantResponse>;
}

export interface ProductWrapperUpdateRequest {
  id: number;
  name: string;
  category_id: number | null;
  category: string | null;
  material_id: number | null;
  material: string | null;
  goods: string | null;
  brand: string | null;
  brand_name: string | null;
  made_in_id: number | null;
  made_in: string | null;
  description: string | null;
  content: string | null;
  merchandiser_code: string | null;
  merchandiser: string | null;
  designer_code: string | null;
  designer: string | null;
  tags: string | null;
  status: string;
  status_name: string | null;
  care_labels: string | null;
  unit: string | null;
  product_type: string | null;
  collections: Array<CollectionResponse>;
  specifications: string | null;
  variants: Array<VariantResponse>;
}

export interface VariantResponse extends BaseObject {
  amount: number;
  name: string;
  on_hand: number;
  inventory: number;
  available: number | null;
  category: string;
  supplier_ids: Array<number>;
  supplier: string;
  color_id: number;
  color: string;
  color_code?: string;
  size_id: number;
  size: string;
  barcode: string;
  taxable: boolean;
  saleable: boolean;
  sku: string;
  status: string;
  status_name: string;
  composite: boolean;
  width: number | null;
  length: number | null;
  height: number | null;
  weight: number;
  weight_unit: string;
  length_unit: string;
  composites: string;
  product_id: number;
  product_name: string;
  product_code: string;
  product: ProductResponse;
  variant_prices: Array<VariantPricesResponse>;
  variant_images: Array<VariantImage>;
  transfer_quantity: number;
  variant_id: number;
  variant_name?: string;
  real_quantity?: number;
  total_stock?: number;
  committed?: number;
  on_hold?: number;
  defect?: number;
  in_coming?: number;
  on_way?: number;
  transferring?: number;
  shipping?: number;
  reference_barcodes?: string | null;
  type?: number;
  suppliers?: Array<SupplierResponse> | null;
}

export interface VariantBarcodeLineItem extends VariantResponse {
  quantity_req: number | null;
  image_url?: string;
}

export interface VariantSearchQuery extends BaseQuery {
  info?: string;
  barcode?: string;
  brand?: string;
  brands?: string;
  made_in?: string;
  made_ins?: string;
  from_inventory?: number;
  to_inventory?: number;
  merchandiser?: string;
  merchandisers?: string;
  from_create_date?: Date;
  from_created_date?: Date;
  to_create_date?: Date;
  to_created_date?: Date;
  size?: string;
  sizes?: string;
  designer?: string;
  designers?: string;
  status?: string;
  main_color?: string;
  main_colors?: string;
  color?: string;
  colors?: string;
  supplier?: string;
  suppliers?: string;
  saleable?: boolean;
  active?: boolean;
  store_id?: number;
  store_ids?: number | null;
  sort_column?: string;
  sort_type?: string;
  variant_ids?: string;
  remain?: string;
  collections?: string;
}
export interface ProductWrapperSearchQuery extends BaseQuery {
  info?: string;
  category_id?: number | "";
  category_ids?: number | "";
  designers?: string;
  material_id?: number | "";
  material_ids?: number | "";
  merchandisers?: string;
  from_create_date?: string;
  to_create_date?: string;
  status?: string;
  goods?: string;
  product_ids?: Array<number>;
  collections?: string;
  codes?: string;
}

export interface VariantPriceRequest {
  import_price: number | null;
  retail_price: number | null;
  wholesale_price: number | null;
  cost_price: number | null;
  currency_code: string;
  tax_percent: number | null;
}

export interface VariantRequest {
  status: string;
  name: string;
  color_id: number | null;
  size_id: number | null;
  barcode: string | null;
  taxable: boolean | null;
  saleable: boolean | null;
  deleted: boolean;
  sku: string;
  width: number | null;
  height: number | null;
  length: number | null;
  length_unit: string | null;
  weight: number | null;
  supplier_ids: Array<number> | null;
  suppliers: Array<number> | null;
  weight_unit: string | null;
  variant_prices: Array<VariantPriceRequest>;
  variant_images: Array<VariantImage>;
  inventory: 0;
  version?: number;
  type?: number;
}

export interface VariantUpdateRequest {
  id: number | null;
  barcode: string | null;
  color_id: number | null;
  composite: boolean;
  height: number | null;
  length: number | null;
  length_unit: string | null;
  name: string;
  product_id: number | null;
  saleable: boolean | null;
  size_id: number | null;
  sku: string;
  taxable: boolean | null;
  status: string;
  deleted: boolean;
  supplier_ids: Array<number> | null;
  width: number | null;
  weight: number | null;
  weight_unit: string | null;
  variant_prices: Array<VariantPriceRequest>;
  variant_images: Array<VariantImage> | null;
}

export interface ProductRequest {
  brand: string | null;
  category_id: number | null;
  code: string;
  content: string | null;
  description: string | null;
  designer_code: string | null;
  goods: string | null;
  made_in_id: number | null;
  merchandiser_code: string | null;
  name: string;
  care_labels: string;
  specifications: string;
  product_type: string | null;
  status: string;
  tags: string | null;
  variants: Array<VariantRequest>;
  unit: string | null;
  material_id: number | null;
  suppliers: Array<number> | null;
  material: string | null;
  collections?: Array<string>;
  product_collections?: Array<string>;
  type?: number;
  component: string | null;
  advantages: string | null;
  defect: string | null;
}

export interface BarcodePrintTemEditNoteRequest {
  note: Pick<BarcodePrintHistoriesResponse, "note">;
}

export interface VariantRequestView {
  name: string;
  color_id: number | null;
  color: string | null;
  code: string | null;
  size_id: number | null;
  size: string | null;
  sku: string;
  quantity: number | null;
  variant_images: Array<VariantImage>;
  saleable?: boolean;
  defect_code?: string;
  type?: number;
}

export interface VariantPriceViewRequest {
  retail_price: number | "";
  import_price: number | "";
  wholesale_price: number | "";
  cost_price: number | "";
  currency: string;
  tax_percent: number | "";
}

export interface ProductRequestView {
  product_type?: string | null;
  goods: string | null;
  category_id: number | null;
  code: string;
  name: string;
  width: number | null;
  height: number | null;
  length: number | null;
  length_unit: string | null;
  weight: number | null;
  weight_unit: string | null;
  tags: string;
  unit: string | null;
  brand: string | null;
  content: string | null;
  description: string | null;
  designer_code: string | null;
  made_in_id: number | null;
  merchandiser_code: string | null;
  care_labels: string;
  specifications: string;
  status: string;
  variant_prices: Array<VariantPriceViewRequest>;
  saleable: boolean;
  material_id: number | null;
  suppliers: Array<number> | null;
  material: string | null;
  collections: Array<CollectionResponse>;
  product_collections: Array<string>;
  component: string | null;
  advantages: string | null;
  defect: string | null;
}

export interface ProductUpdateView {
  product_type?: string | null;
  goods: string | null;
  category_id: number | null;
  tags: Array<string>;
  product_unit: string | null;
  brand: string | null;
  content: string | null;
  description: string | null;
  designer_code: string | null;
  made_in_id: number | null;
  merchandiser_code: string | null;
  care_labels: string;
  specifications: string;
  material_id: number;
  collections: Array<string>;
}

export interface ProductHistoryResponse extends BaseObject {
  history_type: string;
  product_id: number;
  product_code: string;
  product_name: string;
  variant_id: number | null;
  variant_name: null | string;
  sku: null | string;
  data_old: null | string;
  data_current: string;
  action_by: string;
  action_name: string;
  action_date: Date;
  history_type_name: string;
}

export interface ProductHistoryQuery extends BaseQuery {
  condition?: string;
  history_type?: string;
}

export interface ProductBarcodeRequest {
  type_name: string;
  variants: Array<ProductBarcodeItem>;
}

export interface ProductBarcodeItem {
  variant_id: number;
  quantity_req: number;
}

export interface BarcodePrintHistoriesResponse extends BaseObject {
  sku: string;
  barcode: string;
  reference_barcodes: string | null;
  name: string;
  retail_price: number;
  quantity_print: number;
  order_code: string;
  supplier_id: number;
  supplier: string;
  note: string | null;
  order_id: number;
  product_id: number;
  variant_id: number;
  order_reference?: string;
}
export interface ProductBarcodePrintHistories extends BaseQuery {
  condition?: string;
}
export interface CareLabelItem {
  value: string;
  name: string;
  active: boolean;
  type?: number;
}

export interface VariantSku3Response {
  code: string;
}

export interface ProductStatusRequest {
  product_ids: Array<number>;
  status: string;
}
