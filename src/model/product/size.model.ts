
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
  code: string,
}


export interface SizeQuery extends BaseQuery {
  category_id?: ""|number,
  code?: string,
  ids?: string
}


export interface SizeCreateRequest {
  id: number|null,
  code: string,
}

export interface SizeUpdateRequest extends SizeCreateRequest  {
  version: number,
}
