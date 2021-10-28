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

export interface RoleSearchQuery {
  name?: string;
  page?: number;
  size?: number;
}

export interface AuthenRequest {
  user_name: string;
  password: string;
}

export interface RoleProfile {
  code: string;
  name: string;
}
