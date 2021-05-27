import { BaseQuery } from "./base.query";

export interface MaterialQuery extends BaseQuery {
  component?: string, 
  created_name?: string, 
  description?: string, 
  info?: string,
  sort_column?: string, 
  sort_type?: string
}