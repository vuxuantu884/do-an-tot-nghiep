import { PositionResponse } from 'model/account/position.model';
import { DepartmentResponse } from 'model/account/department.model';
import { call, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { AccountType } from "domain/types/account.type";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { searchAccountApi,getDepartmentAllApi,getPositionAllApi } from "service/accounts/account.service";

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
  } catch (e) {


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
      default:
        break;
    }
  } catch (e) {}
}

function* DepartmentGetListSaga(action: YodyAction) {
  let {  setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<DepartmentResponse>> = yield call(getDepartmentAllApi);
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
  let {  setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<PositionResponse>> = yield call(getPositionAllApi);
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
  yield takeLatest(AccountType.GET_LIST_DEPARTMENT_REQUEST, DepartmentGetListSaga);
  yield takeLatest(AccountType.GET_LIST_POSITION_REQUEST, PositionGetListSaga);
}
