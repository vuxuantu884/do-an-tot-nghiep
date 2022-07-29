import { ModuleAuthorizeQuery } from "model/auth/module.model";

const GET_ALL_MODULE_LIMIT = 200;
export const getAllModuleParam: ModuleAuthorizeQuery = {
  get_permission: true,
  limit: GET_ALL_MODULE_LIMIT,
  status: "ACTIVE",
};
