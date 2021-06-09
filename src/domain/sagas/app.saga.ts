import { isUndefinedOrNull } from '../../utils/AppUtils';
import { takeLatest, call, put } from "@redux-saga/core/effects";
import { AppType } from "domain/types/app.type";
import { getToken } from "utils/LocalStorageUtils";
import { loadUserFromStorageSuccessAction, loadUserFromStorageFailAction} from 'domain/actions/app.action';
import { getAcccountDetail } from 'service/accounts/account.service';
import BaseResponse from 'base/BaseResponse';
import { AccountResponse } from 'model/response/accounts/account-detail.response';
import { HttpStatus } from 'config/HttpStatus';

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

export function* appSaga() {
  yield takeLatest(AppType.LOAD_USER_FROM_STORAGE, loadUserFromStorageSaga)
}