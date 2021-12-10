import { isUndefinedOrNull } from 'utils/AppUtils';
import { takeLatest, call, put } from "@redux-saga/core/effects";
import { AppType } from "domain/types/app.type";
import { getSettingApp, getToken } from "utils/LocalStorageUtils";
import { loadUserFromStorageSuccessAction, loadSettingAppResultAction, loadUserFromStorageFailAction} from 'domain/actions/app.action';
import { getAccountDetail } from 'service/accounts/account.service';
import BaseResponse from 'base/base.response';
import { AccountResponse } from 'model/account/account.model';
import { HttpStatus } from 'config/http-status.config';
import { AppSettingReducerType } from 'model/reducers/AppSettingReducerType';
import { unauthorizedAction } from 'domain/actions/auth/auth.action';

function* loadUserFromStorageSaga() {
  let token: string = yield call(getToken);
  //TODO: Handle token here
  if(!isUndefinedOrNull(token)) {
    try {
      let response: BaseResponse<AccountResponse> = yield call(getAccountDetail); 
      switch(response.code) {
        case HttpStatus.SUCCESS:
          // user_id using on POS, need save to local_storage
          localStorage.setItem('user_id', response.data.user_id ? response.data.user_id : "");
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