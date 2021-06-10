import { BaseQuery } from './base.query';

export interface SizeQuery extends BaseQuery {
  category_id?: ""|number,
  code?: string,
}