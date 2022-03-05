import BaseResponse from "base/base.response";
import { YodyAction } from "base/base.action";
import { showError } from "utils/ToastUtils";
import { StoreResponse } from "model/core/store.model";
import { call, put, takeLatest } from "@redux-saga/core/effects";
import { HttpStatus } from "config/http-status.config";
import { ImportType } from "domain/types/core.type";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { uploadFileApi } from "service/core/import.service";

function* uploadSaga(action: YodyAction) {
  let {files, folder, onResult } = action.payload;
  try {
    let response: BaseResponse<Array<StoreResponse>> = yield call(uploadFileApi,
      files,
      folder);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* importSaga() {
  yield takeLatest(ImportType.UPLOAD_CORE_FILE, uploadSaga);
}
