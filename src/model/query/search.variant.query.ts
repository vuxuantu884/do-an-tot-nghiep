import { BaseQuery } from "./base.query";

export interface SearchVariantQuery extends BaseQuery {
  info?: string, 
  barcode?: string, 
  brand?: number, 
  made_in?:number,
  from_inventory?:number,
  to_inventory?:number,
  merchandiser?:string,
  from_create_date?:Date,
  to_create_date?:Date,
  size?:number,
  status?:string,
  main_color?:number,
  color?:number,
  supplier?:number
}