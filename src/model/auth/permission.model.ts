export interface PermissionChildren {
  module_name: string,
  id: number,
  code: string,
  decentralization: boolean
}

export interface PermissionResponse {
  module_name: string,
  id: number,
  code: string,
  permissions: Array<PermissionChildren>,
}

export interface PermissionQuery {
  page?: number,
  size?: number,
}