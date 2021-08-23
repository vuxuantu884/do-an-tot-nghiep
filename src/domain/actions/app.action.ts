import BaseAction from "base/BaseAction";
import { AppType } from "domain/types/app.type";
import { AccountResponse } from "model/account/account.model";
import { AppSettingReducerType } from "model/reducers/AppSettingReducerType";

export const loadUserFromStorageAction = () => {
  return BaseAction(AppType.LOAD_USER_FROM_STORAGE, null);
};

export const loadSettingAppAction = () => {
  return BaseAction(AppType.LOAD_SETTING_APP, null);
};

export const loadSettingAppResultAction = (data: AppSettingReducerType) => {
  return BaseAction(AppType.LOAD_SETTING_APP_RESULT, { data });
};

export const saveSettingAction = (data: AppSettingReducerType) => {
  return BaseAction(AppType.LOAD_SETTING_APP_REQUEST, { data });
};

export const loadUserFromStorageSuccessAction = (account: AccountResponse) => {
  return BaseAction(AppType.LOAD_USER_FROM_STORAGE_SUCCESS, { account });
};

export const loadUserFromStorageFailAction = () => {
  return BaseAction(AppType.LOAD_USER_FROM_STORAGE_FAIL, null);
};
