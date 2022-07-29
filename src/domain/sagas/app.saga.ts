import { isUndefinedOrNull } from "utils/AppUtils";
import { takeLatest, call, put } from "@redux-saga/core/effects";
import { AppType } from "domain/types/app.type";
import { ACCOUNT_CODE_LOCAL_STORAGE, getSettingApp, getToken } from "utils/LocalStorageUtils";
import {
  loadUserFromStorageSuccessAction,
  loadSettingAppResultAction,
  loadUserFromStorageFailAction,
} from "domain/actions/app.action";
import { getAccountDetail } from "service/accounts/account.service";
import BaseResponse from "base/base.response";
import { AccountResponse } from "model/account/account.model";
import { HttpStatus } from "config/http-status.config";
import { AppSettingReducerType } from "model/reducers/AppSettingReducerType";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import OtherType from "domain/types/other.type";
import { showError } from "utils/ToastUtils";
import { YodyAction } from "base/base.action";

function* loadUserFromStorageSaga(action: YodyAction) {
  const { handleData } = action.payload;
  let token: string = yield call(getToken);
  //TODO: Handle token here
  if (!isUndefinedOrNull(token)) {
    try {
      let response: BaseResponse<AccountResponse> = yield call(getAccountDetail);
      switch (response.code) {
        case HttpStatus.SUCCESS:
          yield put(loadUserFromStorageSuccessAction(response.data));
          handleData?.(response.data);
          localStorage.setItem(ACCOUNT_CODE_LOCAL_STORAGE, response?.data?.code);
          break;
        case HttpStatus.UNAUTHORIZED:
          yield put(loadUserFromStorageFailAction());
          yield put(unauthorizedAction());
          break;
        default:
          yield put(loadUserFromStorageFailAction());
          yield put(unauthorizedAction());
          break;
      }
    } catch (error) {
      yield put(loadUserFromStorageFailAction());
      yield put(unauthorizedAction());
    }
  } else {
    yield put(loadUserFromStorageFailAction());
    yield put(unauthorizedAction());
  }
}

function* loadSettingAppSaga() {
  let appSetting: string = yield call(getSettingApp);
  let appSettingObj: AppSettingReducerType = JSON.parse(appSetting);
  if (!isUndefinedOrNull(appSettingObj)) {
    yield put(loadSettingAppResultAction(appSettingObj));
  }
}

function* fetchApiErrorSaga(action: YodyAction) {
  let { textApiInformation, response } = action.payload;
  switch (response.code) {
    case HttpStatus.UNAUTHORIZED:
      yield put(unauthorizedAction());
      break;
    default:
      if (response?.message) {
        showError(`${textApiInformation}: ${response?.message}`);
      }
      if (response?.errors && response?.errors.length > 0) {
        response?.errors?.forEach((e: any) => showError(e));
      }
      break;
  }
}

export function* appSaga() {
  yield takeLatest(AppType.LOAD_USER_FROM_STORAGE, loadUserFromStorageSaga);
  yield takeLatest(AppType.LOAD_SETTING_APP, loadSettingAppSaga);
  yield takeLatest(OtherType.FETCH_API_ERROR, fetchApiErrorSaga);
}
