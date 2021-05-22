import BaseAction from "base/BaseAction"
import { AppType } from "domain/types/app.type"

export const loadUserFromStorageAction = () => {
  return BaseAction(AppType.LOAD_USER_FROM_STORAGE, null);
}

export const loadUserFromStorageSuccessAction = () => {
  return BaseAction(AppType.LOAD_USER_FROM_STORAGE_SUCCESS, null);
}

export const loadUserFromStorageFailAction = () => {
  return BaseAction(AppType.LOAD_USER_FROM_STORAGE_FAIL, null);
}
