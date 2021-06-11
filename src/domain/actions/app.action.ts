import BaseAction from "base/BaseAction"
import { AppType } from "domain/types/app.type"
import { AccountResponse } from "model/account/account.model";

export const loadUserFromStorageAction = () => {
  return BaseAction(AppType.LOAD_USER_FROM_STORAGE, null);
}

export const loadUserFromStorageSuccessAction = (account: AccountResponse) => {
  return BaseAction(AppType.LOAD_USER_FROM_STORAGE_SUCCESS, {account});
}

export const loadUserFromStorageFailAction = () => {
  return BaseAction(AppType.LOAD_USER_FROM_STORAGE_FAIL, null);
}
