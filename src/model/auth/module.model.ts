import {BaseQuery} from "model/base/base.query";
import {PermissionsAuthorize} from "./permission.model";
export interface ModuleAuthorize {
  id: number;
  description?: string;
  code: string;
  name: string;
  check_store?: boolean;
  version?: number;
  permissions: Array<PermissionsAuthorize>;
}

export interface ModuleAuthorizeQuery extends BaseQuery {
  status?: "ACTIVE" | "INACTIVE";
  name?: string;
  check_store?: boolean | null; // null : both of check and not
  get_permission?: boolean; // return permission list if true
}
