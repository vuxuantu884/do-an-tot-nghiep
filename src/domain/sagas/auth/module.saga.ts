import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { ModuleType } from "domain/types/auth.type";
import { PageResponse } from "model/base/base-metadata.response";
import Module from "module";
import { getModuleApi } from "service/auth/module.service";
import { showError } from "utils/ToastUtils";

function* getModuleSaga(action: YodyAction) {
  let { params, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<Module>> = yield call(getModuleApi, params);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        break;
    }
  } catch (e) {
    showError("Lỗi tải dữ liệu nhóm quyền");
  }
}

export function* moduleSaga() {
  yield takeLatest(ModuleType.GET_MODULE, getModuleSaga);
}
