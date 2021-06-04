import { BaseQuery } from "./base.query";

export interface ColorSearchQuery extends BaseQuery {
  info?: string, 
  hex_code?: string, 
  is_main_color?: number,
  parent_id?: number
}