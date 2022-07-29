import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { ModuleAuthorizeQuery } from "model/auth/module.model";
import { PageResponse } from "model/base/base-metadata.response";
import Module from "module";

export const getModuleApi = (
  params: ModuleAuthorizeQuery,
): Promise<BaseResponse<PageResponse<Module>>> => {
  return BaseAxios.get(`${ApiConfig.AUTH}/modules`, { params });
};
