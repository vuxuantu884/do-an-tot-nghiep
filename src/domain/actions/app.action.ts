import BaseAction from "base/base.action";
import BaseResponse from "base/base.response";
import { AppType } from "domain/types/app.type";
import OtherType from "domain/types/other.type";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AppSettingReducerType } from "model/reducers/AppSettingReducerType";

export const loadUserFromStorageAction = (handleData?: (account: AccountResponse) => void) => {
  return BaseAction(AppType.LOAD_USER_FROM_STORAGE, { handleData });
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

export const fetchApiErrorAction = (
  response: BaseResponse<any> | PageResponse<any>,
  textApiInformation: string,
) => {
  return {
    type: OtherType.FETCH_API_ERROR,
    payload: {
      response,
      textApiInformation,
    },
  };
};
