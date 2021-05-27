import BaseAction from "base/BaseAction"
import { AppType } from "domain/types/app.type"
import { AccountDetailResponse } from "model/response/accounts/account-detail.response";

export const loadUserFromStorageAction = () => {
  return BaseAction(AppType.LOAD_USER_FROM_STORAGE, null);
}

export const loadUserFromStorageSuccessAction = (account: AccountDetailResponse) => {
  return BaseAction(AppType.LOAD_USER_FROM_STORAGE_SUCCESS, {account});
}

export const loadUserFromStorageFailAction = () => {
  return BaseAction(AppType.LOAD_USER_FROM_STORAGE_FAIL, null);
}
