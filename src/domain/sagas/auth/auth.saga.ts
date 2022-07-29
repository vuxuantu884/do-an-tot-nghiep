import { delay, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import {
  logoutSuccessAction,
  loginSuccessAction,
  unauthorizedSuccessAction,
} from "domain/actions/auth/auth.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { AuthType } from "domain/types/auth.type";
import { AuthenRequest } from "model/auth/roles.model";
import { LoginResponse } from "model/account/account.model";
import { call } from "redux-saga/effects";
import { loginApi } from "service/accounts/account.service";
import { removeToken, setToken } from "utils/LocalStorageUtils";
import { showError } from "utils/ToastUtils";

function* loginSaga(action: YodyAction) {
  let { username, password, setLoading } = action.payload;
  try {
    let request: AuthenRequest = {
      user_name: username,
      password: password,
    };
    setLoading(true);
    let response: BaseResponse<LoginResponse> = yield call(loginApi, request);
    setLoading(false);
    switch (response.code) {
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
    // showError('Có lỗi vui lòng thử lại sau')
  }
}

function* logoutSaga(action: YodyAction) {
  // const request = action.payload;
  yield put(showLoading());
  // try {
  //   yield call(logoutApi, request);
  // } catch (error) {}

  yield removeToken();
  yield delay(1000);
  yield put(hideLoading());
  yield put(logoutSuccessAction());
}

function* unauthorizeSaga() {
  yield removeToken();
  yield put(unauthorizedSuccessAction());
}

export function* authSaga() {
  yield takeLatest(AuthType.LOGIN_REQUEST, loginSaga);
  yield takeLatest(AuthType.LOGOUT_REQUEST, logoutSaga);
  yield takeLatest(AuthType.UNAUTHORIZED_REQUEST, unauthorizeSaga);
}
