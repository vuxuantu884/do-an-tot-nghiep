import { PermissionQuery, PermissionResponse } from 'model/auth/permission.model';
import BaseResponse from "base/base.response";
import { PageResponse } from "model/base/base-metadata.response";
import { generateQuery } from 'utils/AppUtils';
import BaseAxios from 'base/base.axios';
import { ApiConfig } from 'config/ApiConfig';

export const permissionModuleListApi = (query: PermissionQuery): Promise<BaseResponse<PageResponse<PermissionResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.AUTH}/module-permissions?${params}`);
}
