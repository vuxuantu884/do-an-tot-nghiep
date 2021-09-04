import BaseAction from "base/base.action"
import { PermissionType } from "domain/types/auth.type";
import { PermissionResponse } from "model/auth/permission.model";
import { PageResponse } from "model/base/base-metadata.response";

export const permissionGetAll = (setResult: (result: PageResponse<PermissionResponse>|false) => void) => {
  return BaseAction(PermissionType.GET_LIST_PERMISSION, {setResult});
}
