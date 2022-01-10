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
 version: number,
 collection_code: string,
 add_product_ids?: Array<string>,
 remove_product_ids?: Array<string>,
}

export interface CollectionResponse extends BaseObject {
  name: string,
  description: string
}
 