import { BaseModel } from "./BaseModel";

export interface ProductModel extends BaseModel {
  category_id: number,
  category: string,
  material_id: number
  goods: string,
  material: string,
  brand: string,
  brand_name: string,
  made_in_id: number,
  made_in: string,
  description: string,
  content: string,
  merchandiser_code: string,
  designer_code: string,
  merchandiser: string,
  designer: string,
  tags: string,
  status: string,
  status_name: string,
  name: string,
  preservation: string,
  unit: string,
  product_type: string,
  product_collections: [];
}

export interface VariantImage {
  id: number;
  variant_id: number;
  position: number;
  thumbnail: string;
  original: string;
  normal: string;
  product_avatar: boolean;
  variant_avatar: boolean;
}

export interface VariantPrice {
  id: number;
  price_type: string;
  price: number;
  variant_id: number;
  currency_code: string;
  currency_symbol: string;
  tax_percent: number;
}

export interface VariantModel extends BaseModel {
  name: string;
  inventory: number;
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
  product: ProductModel;
  variant_prices: Array<VariantPrice>;
  variant_images: Array<VariantImage>;
}


