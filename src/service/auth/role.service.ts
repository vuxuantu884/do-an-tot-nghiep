import { PageResponse } from 'model/base/base-metadata.response';
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/ApiConfig";
import { RoleResponse, RoleSearchQuery } from 'model/auth/roles.model';
import { generateQuery } from "utils/AppUtils";

export const roleGetListAPI = (query:RoleSearchQuery): Promise<BaseResponse<PageResponse<RoleResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.AUTH}/roles?${params}`);
}


