import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { RoleResponse, RoleSearchQuery } from 'model/auth/roles.model';
import { generateQuery } from "utils/AppUtils";

export const RoleGetListService = (query:RoleSearchQuery): Promise<BaseResponse<Array<RoleResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.AUTH}/roles?${params}`);
}

