import { BaseQuery } from 'model/base/base.query';
import { BaseObject } from 'model/base/base.response';


export interface ProductCollectionsResponse  {
  id:number,
  collection:string,
  product_id:number
}

export interface VariantImagesResponse  {
  id:number,
  variant_id:number,
  position:string,
  image_id:number,
  url: string,
  variant_avatar:boolean,
  product_avatar:boolean
}


export interface VariantPricesResponse  {
  id:number,
  price_type:string,
  price:number,
  variant_id:number,
  currency_code:string,
  currency_symbol:string,
  tax_percent:number
}

export interface ProductResponse extends BaseObject {
  name: string,
  category_id: number,
  category: string,
  material_id: number,
  material:string,
  goods:string,
  brand:string,
  brand_name:string,
  made_in_id:number,
  made_in:string,
  description:string,
  content:string,
  merchandiser_code:string,
  merchandiser:string,
  designer_code:string,
  designer:string,
  tags:string,
  status:string,
  status_name:string,
  preservation:string,
  unit:string,
  product_type:string,
}


export interface VariantResponse extends BaseObject {
  name: string,
  inventory: number,
  category: string,
  supplier_id:number,
  supplier:string,
  color_id:string,
  color:string,
  size_id:number,
  size:string,
  barcode:string,
  taxable:boolean,
  saleable:boolean,
  sku:string,
  status:string,
  status_name:string,
  composite:boolean,
  width:number,
  length:number,
  height:number,
  weight:number,
  weight_unit:string,
  length_unit:string,
  composites:string,
  product_id:string,
  product:ProductResponse,
  variant_prices:Array<VariantPricesResponse>,
  variant_images:Array<VariantImagesResponse>
}


export interface VariantSearchQuery extends BaseQuery {
  info?: string, 
  barcode?: string, 
  brand?: string, 
  made_in?:string,
  from_inventory?:number,
  to_inventory?:number,
  merchandiser?:string,
  from_create_date?:Date,
  to_create_date?:Date,
  size?:string,
  status?:string,
  main_color?:string,
  color?:string,
  supplier?:string
}

export interface VariantPriceRequest {
  price: number,
  currency_code: string,
  price_type: string,
  tax_percent: number,
  version?: number,
}

export interface VariantRequest {
  status: string,
  name: string,
  color_id: number,
  size_id: number,
  barcode: string|null,
  taxable: boolean|null,
  saleable: boolean|null
  deleted: boolean,
  sku: string,
  width: number|null,
  height: number|null,
  length: number|null,
  length_unit: string|null,
  weight: number|null,
  weight_unit: number|null,
  variant_prices: Array<VariantPriceRequest>
  product: null,
  variant_images: null,
  inventory: 0,
  version?: null,
}