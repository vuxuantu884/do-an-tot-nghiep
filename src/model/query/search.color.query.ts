import { BaseQuery } from "./base.query";

export interface SearchColorQuery extends BaseQuery {
  info?: string, 
  hex_code?: string, 
  is_main_color?: boolean
}