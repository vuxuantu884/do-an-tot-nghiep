import { BaseQuery } from "model/base/base.query";
import { BaseObject } from "model/base/base.response";


export interface MaterialQuery extends BaseQuery {
  component?: string, 
  created_name?: string, 
  description?: string, 
  info?: string,
  sort_column?: string, 
  sort_type?: string
}

export interface MaterialCreateRequest {
  code: string,
  component: string,
  description: string,
  name: string,
}

export interface MaterialUpdateRequest extends MaterialCreateRequest {
  version: number,
}

export interface MaterialResponse extends BaseObject {
  name: string,
  component: string,
  description: string,
}