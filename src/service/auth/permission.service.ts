import { AuthProfilePermission, PermissionQuery, PermissionResponse } from 'model/auth/permission.model';
import BaseResponse from "base/base.response";
import { PageResponse } from "model/base/base-metadata.response";
import { generateQuery } from 'utils/AppUtils';
import BaseAxios from 'base/base.axios';
import { ApiConfig } from 'config/api.config';

export const permissionModuleListApi = (query: PermissionQuery): Promise<BaseResponse<PageResponse<PermissionResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.AUTH}/module-permissions?${params}`);
}

export const profilePermissionApi = (
  operator_kc_id: string
): Promise<BaseResponse<AuthProfilePermission>> => {
  const url = `${ApiConfig.AUTH}/profile`;
  const config = {
    headers: {
      operator_kc_id,
    },
  };
  return BaseAxios.get(url, config);
};
