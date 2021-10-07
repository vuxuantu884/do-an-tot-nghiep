import { BaseObject } from "model/base/base.response";

export interface RoleResponse extends BaseObject {
  name: string;
  note: string;
}

export interface RoleSearchQuery {
  name?: string;
  page?: number;
  size?: number;
}

export interface AuthenRequest {
  user_name: string,
  password: string,
}

export interface RoleProfile {
  code: string;
  name: string;
}