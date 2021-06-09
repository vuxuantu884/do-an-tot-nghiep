
import { BaseObject } from '../base.response';

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