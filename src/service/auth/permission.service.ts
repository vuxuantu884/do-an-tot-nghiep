import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { AuthProfilePermission, UserPermissionRequest } from "model/auth/permission.model";

// export const permissionModuleListApi = (query: PermissionQuery): Promise<BaseResponse<PageResponse<PermissionResponse>>> => {
//   let params = generateQuery(query);
//   return BaseAxios.get(`${ApiConfig.AUTH}/module-permissions?${params}`);
// }

export const profilePermissionApi = (
  operator_kc_id: string,
): Promise<BaseResponse<AuthProfilePermission>> => {
  const url = `${ApiConfig.AUTH}/profile`;
  const config = {
    headers: {
      operator_kc_id,
    },
  };
  return BaseAxios.get(url, config);
};

export const updateAccountPermissionApi = (
  params: UserPermissionRequest,
): Promise<BaseResponse<string>> => {
  const url = `${ApiConfig.AUTH}/permissions/users`;
  return BaseAxios.put(url, params);
};
