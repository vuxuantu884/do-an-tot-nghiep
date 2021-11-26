import { PositionResponse } from "model/account/position.model";
import { DepartmentResponse } from "model/account/department.model";
import { call, takeEvery, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { AccountType } from "domain/types/account.type";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import {
  searchAccountApi,
  getDepartmentAllApi,
  getPositionAllApi,
  searchShipperApi,
  AccountCreateService,
  AccountGetByIdService,
  AccountUpdateService,
  AccountDeleteService,
  powerBIEmbededApi,
} from "service/accounts/account.service";
import { showError } from "utils/ToastUtils";
import { put } from "redux-saga/effects";
import { unauthorizedAction } from "domain/actions/auth/auth.action";

function* AccountSearchSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<AccountResponse>> = yield call(
      searchAccountApi,
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
        setData(false);
        break;
    }
  } catch (e) {
    setData(false);
  }
}

function* AccountGetListSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<AccountResponse>> = yield call(
      searchAccountApi,
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

function* AccountCreateSaga(action: YodyAction) {
  const { request, onCreateSuccess } = action.payload;
  try {
    let response: BaseResponse<AccountResponse> = yield call(
      AccountCreateService,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onCreateSuccess(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        onCreateSuccess(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    onCreateSuccess(null);
    console.log("AccountCreateSaga:" + error);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* AccountUpdateSaga(action: YodyAction) {
  const { id, request, setData } = action.payload;
  try {
    let response: BaseResponse<AccountResponse> = yield call(
      AccountUpdateService,
      id,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("AccountUpdateSaga:" + error);
    showError("Có lỗi vui lòng thử lại sau");
  }
}
function* AccountDeleteSaga(action: YodyAction) {
  const { id, deleteCallback } = action.payload;
  try {
    let response: BaseResponse<any | null> = yield call(
      AccountDeleteService,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        deleteCallback(true);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        deleteCallback(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    deleteCallback(false);
    console.log("AccountUpdateSaga:" + error);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* AccountGetByIdSaga(action: YodyAction) {
  const { code, setData } = action.payload;
  try {
    let response: BaseResponse<AccountResponse> = yield call(
      AccountGetByIdService,
      code
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response.data);
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("AccountGetByIdSaga:" + error);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* DepartmentGetListSaga(action: YodyAction) {
  let { setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<DepartmentResponse>> = yield call(
      getDepartmentAllApi
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
function* PositionGetListSaga(action: YodyAction) {
  let { setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<PositionResponse>> = yield call(
      getPositionAllApi
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

function* ShipperSearchSaga(action: YodyAction) {
  let { setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<AccountResponse>> = yield call(
      searchShipperApi
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
  } catch (error) {}
}

function* powerBIEmbededSaga(action: YodyAction) {
  let { params, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<AccountResponse>> = yield call(
      powerBIEmbededApi, params
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
  } catch (error) {}
}

export function* accountSaga() {
  yield takeEvery(AccountType.SEARCH_ACCOUNT_REQUEST, AccountSearchSaga);
  yield takeLatest(AccountType.GET_LIST_ACCOUNT_REQUEST, AccountGetListSaga);
  yield takeLatest(
    AccountType.GET_LIST_DEPARTMENT_REQUEST,
    DepartmentGetListSaga
  );
  yield takeLatest(AccountType.GET_LIST_POSITION_REQUEST, PositionGetListSaga);
  yield takeLatest(AccountType.GET_LIST_SHIPPER_REQUEST, ShipperSearchSaga);
  yield takeLatest(AccountType.GET_ACCOUNT_DETAIL_REQUEST, AccountGetByIdSaga);
  yield takeLatest(AccountType.CREATE_ACCOUNT_REQUEST, AccountCreateSaga);
  yield takeLatest(AccountType.UPDATE_ACCOUNT_REQUEST, AccountUpdateSaga);
  yield takeLatest(AccountType.DELETE_ACCOUNT_REQUEST, AccountDeleteSaga);
  yield takeLatest(AccountType.POWER_BI_EMBEDED_REQUEST, powerBIEmbededSaga);
}
