import { BaseQuery } from "./base.query";

export interface MaterialQuery extends BaseQuery {
  component: string|null, 
  created_name: string|null, 
  description: string|null, 
  info: string|null,
  sort_column: string|null, 
  sort_type: string|null
}