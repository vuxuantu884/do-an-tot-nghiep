import { getBootstrapSuccessAction } from "domain/actions/content/bootstrap.action";
import { takeLatest, call, put } from "@redux-saga/core/effects";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { BootstrapType } from "domain/types/content.type";
import { BootstrapResponse } from "model/content/bootstrap.model";
import { getBootsrapAPI } from "service/content/bootstrap.service";
import { showError } from "utils/ToastUtils";
import { unauthorizedAction } from "domain/actions/auth/auth.action";

function* getBootstrapSaga() {
  try {
    let response: BaseResponse<BootstrapResponse> = yield call(getBootsrapAPI);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        yield put(getBootstrapSuccessAction(response.data));
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* bootstrapSaga() {
  yield takeLatest(BootstrapType.GET_BOOTSTRAP_REQUEST, getBootstrapSaga);
}
