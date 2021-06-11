import { BaseObject } from 'model/base/base.response';

export interface CategoryResponse extends BaseObject {
  name: string,
  gooods: string,
  parent_id: number,
  goods_name: string,
  children: Array<CategoryResponse>,
}