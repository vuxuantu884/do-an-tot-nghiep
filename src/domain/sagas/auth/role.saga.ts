import { roleGetListAPI } from "service/auth/role.service";
import { RoleType } from "domain/types/auth.type";
import { RoleResponse } from "model/auth/roles.model";
import { call, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { PageResponse } from "model/base/base-metadata.response";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { put } from "redux-saga/effects";

function* RoleGetListSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<RoleResponse>> = yield call(
      roleGetListAPI,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data.items);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        break;
    }
  } catch (e) {}
}

function* RoleSearchSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<RoleResponse>> = yield call(
      roleGetListAPI,
      query
    );
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
  } catch (e) {}
}

export function* roleSaga() {
  yield takeLatest(RoleType.GET_LIST_ROLE_REQUEST, RoleGetListSaga);
  yield takeLatest(RoleType.SEARCH_LIST_ROLE_REQUEST, RoleSearchSaga);  
}
