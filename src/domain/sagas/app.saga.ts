import { isUndefinedOrNull } from 'utils/AppUtils';
import { takeLatest, call, put } from "@redux-saga/core/effects";
import { AppType } from "domain/types/app.type";
import { getSettingApp, getToken } from "utils/LocalStorageUtils";
import { loadUserFromStorageSuccessAction, loadSettingAppResultAction, loadUserFromStorageFailAction} from 'domain/actions/app.action';
import { getAcccountDetail } from 'service/accounts/account.service';
import BaseResponse from 'base/BaseResponse';
import { AccountResponse } from 'model/account/account.model';
import { HttpStatus } from 'config/HttpStatus';
import { AppSettingReducerType } from 'model/reducers/AppSettingReducerType';
import { unauthorizedAction } from 'domain/actions/auth/auth.action';

function* loadUserFromStorageSaga() {
  let token: string = yield call(getToken);
  //TODO: Handle token here
  console.log(token);
  if(!isUndefinedOrNull(token)) {
    try {
      let response: BaseResponse<AccountResponse> = yield call(getAcccountDetail); 
      switch(response.code) {
        case HttpStatus.SUCCESS:
          yield put(loadUserFromStorageSuccessAction(response.data));
          break;
        case HttpStatus.UNAUTHORIZED:
          yield put(loadUserFromStorageFailAction())
          yield put(unauthorizedAction());
          break;
        default:
          yield put(loadUserFromStorageFailAction())
          yield put(unauthorizedAction());
          break;
      }
    } catch (error) {
      yield put(loadUserFromStorageFailAction())
      yield put(unauthorizedAction());
    }
  } else {
    yield put(loadUserFromStorageFailAction())
    yield put(unauthorizedAction());
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