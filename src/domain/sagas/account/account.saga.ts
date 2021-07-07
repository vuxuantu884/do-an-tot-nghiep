import { PositionResponse } from "model/account/position.model";
import { DepartmentResponse } from "model/account/department.model";
import { call, takeEvery, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { AccountType } from "domain/types/account.type";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import {
  searchAccountApi,
  getDepartmentAllApi,
  getPositionAllApi,
  AccountCreateService,
  AccountGetByIdService,
  AccountUpdateService,
  AccountDeleteService,
} from "service/accounts/account.service";
import { showError } from "utils/ToastUtils";

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
      default:
        break;
    }
  } catch (e) {}
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
    debugger;
    let response: BaseResponse<AccountResponse> = yield call(
      AccountUpdateService,
      id,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
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
  const { id, deleteCallback} = action.payload;
  try {
    debugger;
    let response: BaseResponse<any|null> = yield call(
      AccountDeleteService,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        deleteCallback(true);
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
  const { id, setData } = action.payload;
  try {
    let response: BaseResponse<AccountResponse> = yield call(
      AccountGetByIdService,
      id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response.data);
        setData(response.data);
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
      default:
        break;
    }
  } catch (e) {}
}

export function* accountSaga() {
  yield takeLatest(AccountType.SEARCH_ACCOUNT_REQUEST, AccountSearchSaga);
  yield takeLatest(AccountType.GET_LIST_ACCOUNT_REQUEST, AccountGetListSaga);
  yield takeLatest(
    AccountType.GET_LIST_DEPARTMENT_REQUEST,
    DepartmentGetListSaga
  );
  yield takeLatest(AccountType.GET_LIST_POSITION_REQUEST, PositionGetListSaga);
  yield takeLatest(AccountType.GET_ACCOUNT_DETAIL_REQUEST, AccountGetByIdSaga);
  yield takeEvery(AccountType.CREATE_ACCOUNT_REQUEST, AccountCreateSaga);
  yield takeEvery(AccountType.UPDATE_ACCOUNT_REQUEST, AccountUpdateSaga);
  yield takeEvery(AccountType.DELETE_ACCOUNT_REQUEST, AccountDeleteSaga);
}
