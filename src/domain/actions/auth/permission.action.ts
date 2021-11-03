import BaseAction from "base/base.action";
import { PermissionType } from "domain/types/auth.type";
import { AuthProfilePermission } from "model/auth/permission.model";

export const profilePermissionAction = (operator_kc_id:string) => {
  return BaseAction(PermissionType.GET_PROFILE_PERMISSION, {operator_kc_id});
}

export const profilePermissionSuccessAction = (profilePermisstion: AuthProfilePermission) => {
  return BaseAction(PermissionType.GET_PROFILE_PERMISSION_SUCCESS, profilePermisstion);
}
