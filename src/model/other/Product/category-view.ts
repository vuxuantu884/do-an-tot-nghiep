import { BaseObject } from "model/base/base.response";

export interface CategoryView extends BaseObject {
  name: string,
  level: number,
  gooods: string,
  goods_name: string,
  parent: CategoryParent|null
}

export interface CategoryParent {
  id: number,
  name: string,
}