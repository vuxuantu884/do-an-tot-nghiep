import { VariantPricesResponse } from './variant.prices.response';
import { VariantImagesResponse } from './variant.images.response';
import { ProductResponse } from './product.response';
import { BaseObject } from './../base.response';


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