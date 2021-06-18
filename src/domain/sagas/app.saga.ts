import { isUndefinedOrNull } from 'utils/AppUtils';
import { takeLatest, call, put } from "@redux-saga/core/effects";
import { AppType } from "domain/types/app.type";
import { getSettingApp, getToken } from "utils/LocalStorageUtils";
import { loadUserFromStorageSuccessAction, loadUserFromStorageFailAction, loadSettingAppResultAction} from 'domain/actions/app.action';
import { getAcccountDetail } from 'service/accounts/account.service';
import BaseResponse from 'base/BaseResponse';
import { AccountResponse } from 'model/account/account.model';
import { HttpStatus } from 'config/HttpStatus';
import { AppSettingReducerType } from 'model/reducers/AppSettingReducerType';

function* loadUserFromStorageSaga() {
  let token: string = yield call(getToken);
  //TODO: Handle token here
  if(!isUndefinedOrNull(token)) {
    try {
      let response: BaseResponse<AccountResponse> = yield call(getAcccountDetail); 
      if(response.code === HttpStatus.SUCCESS) {
        yield put(loadUserFromStorageSuccessAction(response.data));
      } else {
        yield put(loadUserFromStorageFailAction());
      }
    } catch (error) {
      yield put(loadUserFromStorageFailAction());
    }
  } else {
    yield put(loadUserFromStorageFailAction());
  }
}

function* loadSettingAppSaga() {
  let appSetting: string = yield call(getSettingApp);
  let appSettingObj: AppSettingReducerType = JSON.parse(appSetting);
  if(!isUndefinedOrNull(appSettingObj)) {
    yield put(loadSettingAppResultAction(appSettingObj))
  }
}


export function* appSaga() {
  yield takeLatest(AppType.LOAD_USER_FROM_STORAGE, loadUserFromStorageSaga)
  yield takeLatest(AppType.LOAD_SETTING_APP, loadSettingAppSaga)
}