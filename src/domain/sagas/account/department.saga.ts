import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { DepartmentType } from "domain/types/account.type";
import { DepartmentResponse } from "model/account/department.model";
import { call, put, takeLatest } from "redux-saga/effects";
import { departmentCreateApi, departmentDetailApi, departmentSearchApi, departmentUpdateApi } from "service/accounts/department.service";
import { showError } from "utils/ToastUtils";

function* searchSaga(action: YodyAction) {
  let {  onResult } = action.payload;
  try {
    let response: BaseResponse<Array<DepartmentResponse>> = yield call(
      departmentSearchApi,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        onResult(false);
        break;
    }
  } catch (e) {
    onResult(false);
  }
}

function* detailSaga(action: YodyAction) {
  let { id, onResult } = action.payload;
  try {
    let response: BaseResponse<DepartmentResponse> = yield call(
      departmentDetailApi, id,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        onResult(false);
        break;
    }
  } catch (e) {
    onResult(false);
  }
}

function* createSaga(action: YodyAction) {
  let { request, onResult } = action.payload;
  try {
    let response: BaseResponse<DepartmentResponse> = yield call(
      departmentCreateApi, request,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        onResult(false);
        break;
    }
  } catch (e) {
    onResult(false);
  }
}

function* updateSaga(action: YodyAction) {
  let { id, request, onResult } = action.payload;
  try {
    let response: BaseResponse<DepartmentResponse> = yield call(
      departmentUpdateApi, id, request,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        onResult(false);
        break;
    }
  } catch (e) {
    onResult(false);
  }
}

export function* departmentSaga() {
  yield takeLatest(DepartmentType.SEARCH_DEPARTMENT, searchSaga)
  yield takeLatest(DepartmentType.DETAIL_DEPARTMENT, detailSaga)
  yield takeLatest(DepartmentType.CREATE_DEPARTMENT, createSaga)
  yield takeLatest(DepartmentType.UPDATE_DEPARTMENT, updateSaga)
}
