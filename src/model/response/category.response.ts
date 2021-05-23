import { BaseObject } from './base.response';

export interface CategoryResponse extends BaseObject {
  name: string,
  gooods: string,
  parent_id: number,
  goods_name: string,
  children: Array<CategoryResponse>,
}