import { delay, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { logoutSuccessAction, loginSuccessAction } from "domain/actions/account/auth.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { AuthType } from 'domain/types/account.type';
import { LoginRequest } from "model/request/login.request";
import { LoginResponse } from "model/response/accounts/login.response";
import { call } from "redux-saga/effects";
import { loginApi, logoutApi } from "service/accounts/account.service";
import { removeToken, setToken } from "utils/LocalStorageUtils";
import { showError } from "utils/ToastUtils";

function* loginSaga(action: YodyAction) {
  let {username, password, setLoading} = action.payload;
  try {
    let request: LoginRequest = {
      user_name: username,
      password: password,
    };
    setLoading(true);
    let response: BaseResponse<LoginResponse> = yield call(loginApi, request);
    setLoading(false);
    switch(response.code) {
      case HttpStatus.SUCCESS:
        setToken(response.data.access_token);
        yield put(loginSuccessAction());
        break;
      default: 
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (e) {
    setLoading(false);
    showError('Có lỗi vui lòng thử lại sau')
  }
}

function* logoutSaga() {
  yield put(showLoading());
  try {
    yield call(logoutApi); 
  } catch (error) {}
  yield removeToken();
  yield delay(1000);
  yield put(hideLoading());
  yield put(logoutSuccessAction())
}

export function* authSaga() {
  yield takeLatest(AuthType.LOGIN_REQUEST, loginSaga)
  yield takeLatest(AuthType.LOGOUT_REQUEST, logoutSaga)
}