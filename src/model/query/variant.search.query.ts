import { BaseQuery } from "./base.query";

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
