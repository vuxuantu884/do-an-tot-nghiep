import BaseAction from "base/base.action"
import { PermissionType } from "domain/types/auth.type";
import { AuthProfilePermission, PermissionResponse } from "model/auth/permission.model";
import { PageResponse } from "model/base/base-metadata.response";

export const permissionGetAll = (setResult: (result: PageResponse<PermissionResponse>|false) => void) => {
  return BaseAction(PermissionType.GET_LIST_PERMISSION, {setResult});
}

export const profilePermissionAction = (operator_kc_id:string) => {
  return BaseAction(PermissionType.GET_PROFILE_PERMISSION, {operator_kc_id});
}

export const profilePermissionSuccessAction = (profilePermisstion: AuthProfilePermission) => {
  return BaseAction(PermissionType.GET_PROFILE_PERMISSION_SUCCESS, profilePermisstion);
}
