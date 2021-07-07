
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
  searchShipperApi,
  AccountCreateService,
  AccountGetByIdService,
  AccountUpdateService,
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
  const { request, setData } = action.payload;
  try {
    let response: BaseResponse<AccountResponse> = yield call(
      AccountCreateService,
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

function* ShipperSearchSaga(action: YodyAction) {
  let { setData } = action.payload;
  try {
      let response: BaseResponse<PageResponse<AccountResponse>> = yield call(searchShipperApi);
      switch (response.code) {
          case HttpStatus.SUCCESS:
            setData(response.data.items);
              break;
          default:
              break;
      }
  } catch (error) {}
}


export function* accountSaga() {
  yield takeLatest(AccountType.SEARCH_ACCOUNT_REQUEST, AccountSearchSaga);
  yield takeLatest(AccountType.GET_LIST_ACCOUNT_REQUEST, AccountGetListSaga);
  yield takeLatest(
    AccountType.GET_LIST_DEPARTMENT_REQUEST,
    DepartmentGetListSaga
  );
  yield takeLatest(AccountType.GET_LIST_POSITION_REQUEST, PositionGetListSaga);
  yield takeLatest(AccountType.GET_LIST_SHIPPER_REQUEST, ShipperSearchSaga);
  yield takeLatest(AccountType.GET_ACCOUNT_DETAIL_REQUEST, AccountGetByIdSaga);
  yield takeEvery(AccountType.CREATE_ACCOUNT_REQUEST, AccountCreateSaga);
  yield takeEvery(AccountType.UPDATE_ACCOUNT_REQUEST, AccountUpdateSaga);
}
