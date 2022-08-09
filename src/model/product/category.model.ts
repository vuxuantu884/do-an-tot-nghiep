import { BaseObject } from "model/base/base.response";

export interface CategoryQuery {
  query?: string;
  created_name?: string;
  goods?: string;
}

export interface CategoryCreateRequest {
  code: string;
  name: string;
  goods?: string;
  parent_id: number | null;
}

export interface CategoryUpdateRequest extends CategoryCreateRequest {
  version: number;
}

export interface CategoryResponse extends BaseObject {
  name: string;
  goods: string;
  parent_id: number;
  goods_name: string;
  children: Array<CategoryResponse>;
  child_ids: string;
  level: number;
}

export interface CategoryView extends BaseObject {
  name: string;
  level: number;
  goods: string;
  goods_name: string;
  parent: CategoryParent | null;
  child_ids: string;
  isHaveChild: boolean;
}

export interface CategoryParent {
  id: number;
  name: string;
}
