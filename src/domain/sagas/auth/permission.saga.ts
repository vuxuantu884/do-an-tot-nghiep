import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { PermissionType } from "domain/types/auth.type";
import { PermissionResponse } from "model/auth/permission.model";
import { PageResponse } from "model/base/base-metadata.response";
import { call, put, takeLatest } from "redux-saga/effects";
import { permissionModuleListApi } from "service/auth/permission.service";

function* permissionGetListSaga(action: YodyAction) {
  let {setResult} = action.payload;
  try {
    let response: BaseResponse<PageResponse<PermissionResponse>> = yield call(
      permissionModuleListApi,
      {}
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        break;
    }
  } catch (e) {
    setResult(false);
  }
}

export function* permissionSaga() {
  yield takeLatest(PermissionType.GET_LIST_PERMISSION, permissionGetListSaga)
}