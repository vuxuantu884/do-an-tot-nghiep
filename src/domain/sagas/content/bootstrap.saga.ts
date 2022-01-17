import { put, takeLatest } from "@redux-saga/core/effects";
import bootstrapFile from "config/global-enums/bootstrap.json";
import { getBootstrapSuccessAction } from "domain/actions/content/bootstrap.action";
import { BootstrapType } from "domain/types/content.type";
import { showError } from "utils/ToastUtils";
function* getBootstrapSaga() {
  try {
    yield put(getBootstrapSuccessAction(bootstrapFile));
  } catch (error) {
    showError("Lỗi đọc dữ liệu bootstrap");
  }
}

export function* bootstrapSaga() {
  yield takeLatest(BootstrapType.GET_BOOTSTRAP_REQUEST, getBootstrapSaga);
}
