import { BaseQuery } from '../base/base.query';

export interface SizeQuery extends BaseQuery {
  category_id?: ""|number,
  code?: string,
}