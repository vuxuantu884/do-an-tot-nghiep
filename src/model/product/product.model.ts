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
  tags:string|null,
  status:string,
  status_name:string,
  preservation:string,
  unit:string,
  product_type:string,
  product_collections: Array<ProductCollectionsResponse>,
  specifications: string,
}


export interface VariantResponse extends BaseObject {
  name: string,
  inventory: number,
  category: string,
  supplier_id:number,
  supplier:string,
  color_id:number,
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
  width:number|null,
  length:number|null,
  height:number|null,
  weight:number,
  weight_unit:string,
  length_unit:string,
  composites:string,
  product_id:number,
  product:ProductResponse,
  variant_prices:Array<VariantPricesResponse>,
  variant_images:Array<VariantImagesResponse>
}

export interface VariantView extends BaseObject {
  name: string,
  inventory: number,
  category: string,
  supplier_id:number,
  supplier:string,
  color_id:number,
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
  width:number|null,
  length:number|null,
  height:number|null,
  weight:number,
  weight_unit:string,
  length_unit:string,
  composites:string,
  product_id:string,
  product:ProductResponse,
  variant_prices:Array<VariantPriceViewRequest>,
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
}

export interface VariantImageRequest {
  id?: number,
  position: number|null,
  image_id: number,
  url: string,
  variant_avatar: boolean,
  product_avatar: boolean,
}

export interface VariantRequest {
  status: string,
  name: string,
  color_id: number|null,
  size_id: number|null,
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
  weight_unit: string|null,
  variant_prices: Array<VariantPriceRequest>
  variant_images: Array<VariantImageRequest>,
  inventory: 0,
  version?: null,
}

export interface VariantUpdateRequest {
  id:number|null,
  barcode: string|null,
  color_id: number|null, 
  composite:boolean,
  height: number|null,
  length: number|null,
  length_unit: string|null,
  name: string,
  product_id:number|null,
  saleable: boolean|null
  size_id: number|null,
  sku: string,
  taxable: boolean|null,
  status: string,
  deleted: boolean,
  supplier_id:number|null
  width: number|null, 
  weight: number|null,
  weight_unit: string|null,
  variant_prices: Array<VariantPriceRequest>,
  variant_images: Array<VariantImageRequest>|null
}

export interface ProductRequest {
  brand: string|null,
  category_id: number|null,
  code: string,
  content: string|null,
  description: string|null,
  designer_code: string|null,
  goods: string|null,
  made_in_id: number|null,
  merchandiser_code: string|null,
  name: string,
  preservation: string,
  specifications: string,
  product_type: string|null,
  status: string,
  tags: string|null,
  variants: Array<VariantRequest>,
  product_unit: string|null,
}

export interface VariantRequestView {
  name: string,
  color_id: number|null,
  color: string|null,
  size_id: number|null,
  size: string|null,
  sku: string,
  quantity: string|null,
  variant_images: Array<VariantImageRequest>,
}

export interface VariantPriceViewRequest {
  retail_price: string,
  import_price: string,
  whole_sale_price: string,
  currency: string,
  tax_percent: string,
}
export interface ProductRequestView {
  product_type?: string|null,
  goods: string|null,
  category_id: number|null,
  collections: Array<string>,
  code: string,
  name: string,
  width: number|null,
  height: number|null,
  length: number|null,
  length_unit: string|null,
  weight: number|null,
  weight_unit: string|null,
  tags: Array<string>,
  product_unit: string|null,
  brand: string|null,
  content: string|null,
  description: string|null,
  designer_code: string|null,
  made_in_id: number|null,
  merchandiser_code: string|null,
  preservation: string,
  specifications: string,
  status: string,
  variant_prices: Array<VariantPriceViewRequest>,
  saleable: boolean,
}

export interface ProductUpdateView {
  product_type?: string|null,
  goods: string|null,
  category_id: number|null,
  collections: Array<string>,
  tags: Array<string>,
  product_unit: string|null,
  brand: string|null,
  content: string|null,
  description: string|null,
  designer_code: string|null,
  made_in_id: number|null,
  merchandiser_code: string|null,
  preservation: string,
  specifications: string,
  material_id: number,
}

export interface VariantUpdateView {
  id:number|null,
  status: string,
  name: string,
  color_id: number|null,
  size_id: number|null,
  barcode: string|null,
  taxable: boolean|null,
  saleable: boolean|null
  deleted: boolean,
  sku: string,
  width: number|null,
  height: number|null,
  length: number|null,
  length_unit: string|null,
  weight: number,
  weight_unit: string|null,
  variant_prices: Array<VariantPriceViewRequest>,
  variant_image: Array<VariantImageRequest>|null,
  product: ProductUpdateView
  product_id:number|null,
  supplier_id:number|null
}