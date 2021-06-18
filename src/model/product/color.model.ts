import { BaseQuery } from "model/base/base.query";
import { BaseObject } from 'model/base/base.response';


export interface ColorSearchQuery extends BaseQuery {
  info?: string, 
  hex_code?: string, 
  is_main_color?: number,
  parent_id?: number
}

export interface  ColorCreateRequest {
  code: string,
  hex_code: string|null,
  image: string|null
  name: string,
  parent_id:number|null
}


export interface ColorResponse extends BaseObject {
  name:string,
  hex_code: string|null,
  parent_id: number|null
  image: string|null
}