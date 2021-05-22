import { isUndefinedOrNull } from '../../utils/AppUtils';
import { takeLatest, call, put } from "@redux-saga/core/effects";
import { AppType } from "domain/types/app.type";
import { getToken } from "utils/LocalStorageUtils";
import { loadUserFromStorageSuccessAction, loadUserFromStorageFailAction} from 'domain/actions/app.action';

function* loadUserFromStorageSaga() {
  let token: string = yield call(getToken);
  //TODO: Handle token here
  if(!isUndefinedOrNull(token)) {
    yield put(loadUserFromStorageSuccessAction());
  } else {
    yield put(loadUserFromStorageFailAction());
  }
}

export function* appSaga() {
  yield takeLatest(AppType.LOAD_USER_FROM_STORAGE, loadUserFromStorageSaga)
}