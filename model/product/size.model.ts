
import { BaseObject } from 'model/base/base.response';
import { BaseQuery } from 'model/base/base.query';


export interface SizeCategory {
  category_id: number,
  category_name: string,
}

export interface SizeResponse extends BaseObject {
  categories: Array<SizeCategory>
}

export interface SizeDetail extends BaseObject {
  category_ids: Array<number>
}


export interface SizeQuery extends BaseQuery {
  category_id?: ""|number,
  code?: string,
}


export interface SizeCreateRequest {
  category_ids: Array<number>
  code: string,
}

export interface SizeUpdateRequest extends SizeCreateRequest  {
  version: number,
}