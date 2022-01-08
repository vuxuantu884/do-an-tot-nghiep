import { BaseObject } from 'model/base/base.response';
import { BaseQuery } from "model/base/base.query";

export interface CollectionQuery extends BaseQuery{
  condition?: string, 
  created_name?: string, 
  goods?: string,
}

export interface CollectionCreateRequest {
  code: string,
  name: string,
}

export interface CollectionUpdateRequest extends CollectionCreateRequest {
 version: number
}

export interface CollectionResponse extends BaseObject {
  name: string,
  description: string
}
 