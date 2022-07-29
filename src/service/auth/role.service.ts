import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { RoleAuthorize, RoleAuthorizeRequest, RoleSearchQuery } from "model/auth/roles.model";
import { PageResponse } from "model/base/base-metadata.response";
import { generateQuery } from "utils/AppUtils";

export const roleGetListAPI = (
  query: RoleSearchQuery,
): Promise<BaseResponse<PageResponse<RoleAuthorize>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.AUTH}/roles?${params}`);
};

export const createRoleApi = (role: RoleAuthorizeRequest): Promise<BaseResponse<RoleAuthorize>> => {
  return BaseAxios.post(`${ApiConfig.AUTH}/roles`, role);
};

export const getRoleByIdApi = (id: number): Promise<BaseResponse<RoleAuthorize>> => {
  return BaseAxios.get(`${ApiConfig.AUTH}/roles/${id}`);
};

export const updateRoleByIdApi = (
  role: RoleAuthorizeRequest,
): Promise<BaseResponse<RoleAuthorize>> => {
  return BaseAxios.put(`${ApiConfig.AUTH}/roles/${role.id}`, role);
};
