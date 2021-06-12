import { BaseQuery } from "model/base/base.query";
import { BaseObject } from "model/base/base.response";

export interface RoleResponse extends BaseObject {
  name: string;
  note: string;
}

export interface RoleSearchQuery {
  name: string;
  page: number;
  size: number;
}
