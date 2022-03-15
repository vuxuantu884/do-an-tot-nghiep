import { BaseQuery } from "model/base/base.query";
import { BaseObject } from "model/base/base.response";
import { ModuleAuthorize } from "./module.model";
export interface RoleAuthorize extends BaseObject {
  name: string;
  description?: string;
  modules?: ModuleAuthorize[];
}

export interface RoleAuthorizeRequest extends RoleAuthorize {
  permissions?: number[];
}

export interface RoleResponse extends RoleAuthorize {}

export interface RoleSearchQuery extends BaseQuery {
  name?: string;

}

export interface AuthenRequest {
  user_name: string;
  password: string;
}

export interface AuthenLogoutRequest {
  operatorKcId: string;
}
