export interface PermissionsAuthorize {
  id: number;
  role_id: number;
  module_code: string;
  name: string;
  store_id: number;
  version?: number;
  code?: string;
}

// export interface PermissionResponse {
//   module_name: string;
//   id: number;
//   code: string;
//   permissions: Array<Permissions>;
// }

export interface PermissionQuery {
  page?: number;
  size?: number;
}

export interface PermissionName {
  permissions: Array<string>;
}
export interface AuthProfilePermission {
  user_id: string;
  permissions: Array<string>;
}

export interface UserPermissionRequest {
  user_id: string;
  permissions: Array<{
    permission_id: number;
    store_id?: number;
    role_id?: number;
  }>;
}
