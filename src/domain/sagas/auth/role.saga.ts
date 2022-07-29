import { call, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { RoleType } from "domain/types/auth.type";
import { RoleAuthorize, RoleResponse } from "model/auth/roles.model";
import { PageResponse } from "model/base/base-metadata.response";
import { put } from "redux-saga/effects";
import {
  createRoleApi,
  getRoleByIdApi,
  roleGetListAPI,
  updateRoleByIdApi,
} from "service/auth/role.service";
import { showError } from "utils/ToastUtils";

function* RoleGetListSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<RoleResponse>> = yield call(roleGetListAPI, query);
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

function* roleSearchSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<RoleAuthorize>> = yield call(roleGetListAPI, query);
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

function* createRoleSaga(action: YodyAction) {
  let { role, setData } = action.payload;
  try {
    let response: BaseResponse<RoleAuthorize> = yield call(createRoleApi, role);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setData(null);
        yield put(unauthorizedAction());
        break;
      default:
        setData(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (e) {
    setData(null);
    // showError("Hệ thống gặp lỗi lạ");
  }
}

function* getRoleByIdSaga(action: YodyAction) {
  let { id, setData } = action.payload;
  try {
    let response: BaseResponse<RoleAuthorize> = yield call(getRoleByIdApi, id);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setData(null);
        yield put(unauthorizedAction());
        break;
      default:
        setData(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (e) {
    setData(null);
    // showError("Hệ thống gặp lỗi lạ");
  }
}

function* updateRoleSaga(action: YodyAction) {
  let { role, setData } = action.payload;
  try {
    let response: BaseResponse<RoleAuthorize> = yield call(updateRoleByIdApi, role);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setData(null);
        yield put(unauthorizedAction());
        break;
      default:
        setData(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (e) {
    setData(null);
    // showError("Hệ thống gặp lỗi lạ");
  }
}
export function* roleSaga() {
  yield takeLatest(RoleType.GET_LIST_ROLE_REQUEST, RoleGetListSaga);
  yield takeLatest(RoleType.SEARCH_LIST_ROLE_REQUEST, roleSearchSaga);
  yield takeLatest(RoleType.CREATE_ROLES, createRoleSaga);
  yield takeLatest(RoleType.GET_ROLE_BY_ID, getRoleByIdSaga);
  yield takeLatest(RoleType.UPDATE_ROLE, updateRoleSaga);
}
