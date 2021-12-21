import {
    VariantPricesResponse
} from "../product/product.model";

export interface VariantStore {
  id: number;
  code: string;
  version: string;
  created_by: string;
  created_name: string;
  created_date: Date;
  updated_by: string;
  updated_name: string;
  updated_date: Date;
  name: string;
  on_hand: number;
  available: number;
  supplier_id: number;
  supplier: string;
  color_id: number;
  color: string;
  size_id: number;
  size: string;
  barcode: string;
  taxable: boolean;
  saleable: boolean;
  sku: string;
  status: string;
  status_name: string;
  composite: boolean;
  width: number;
  length: number;
  height: number;
  weight: number;
  weight_unit: string;
  length_unit: string;
  product_id: number;
  variant_prices: Array<VariantPricesResponse>;
  variant_images: [];
  composites: string;
}
