import BaseAction from "base/base.action";
import { PermissionType } from "domain/types/auth.type";
import { AuthProfilePermission, UserPermissionRequest } from "model/auth/permission.model";

export const profilePermissionAction = (operator_kc_id:string) => {
  return BaseAction(PermissionType.GET_PROFILE_PERMISSION, {operator_kc_id});
}

export const profilePermissionSuccessAction = (profilePermisstion: AuthProfilePermission) => {
  return BaseAction(PermissionType.GET_PROFILE_PERMISSION_SUCCESS, profilePermisstion);
}

export const updateAccountPermissionAction = (params: UserPermissionRequest, onResult: (data: string)=>void) => {
  return BaseAction(PermissionType.UPDATE_USER_PERMISSION, {params, onResult});
}
