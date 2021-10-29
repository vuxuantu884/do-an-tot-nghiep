import BaseAction from "base/base.action";
import {ModuleType} from "domain/types/auth.type";
import {ModuleAuthorize, ModuleAuthorizeQuery} from "model/auth/module.model";
import {PageResponse} from "model/base/base-metadata.response";
 

export const getModuleAction = (
    params: ModuleAuthorizeQuery,
  setData: (data: PageResponse<ModuleAuthorize>) => void
) => {
  return BaseAction(ModuleType.GET_MODULE, {params, setData});
};
