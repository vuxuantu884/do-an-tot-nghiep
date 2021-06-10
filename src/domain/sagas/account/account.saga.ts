import { PositionResponse } from 'model/account/position.response';
import { DepartmentResponse } from 'model/account/department.response';
import { call, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { AccountType } from "domain/types/account.type";
import { AccountResponse } from "model/account/account.response";
import { PageResponse } from "model/response/base-metadata.response";
import { searchAccountApi,getDepartmentAllApi,getPositionAllApi } from "service/accounts/account.service";

function* searchAccountSaga(action: YodyAction) {
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

function* listAccountSaga(action: YodyAction) {
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

function* listDepartmentSaga(action: YodyAction) {
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
function* listPositionSaga(action: YodyAction) {
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
  yield takeLatest(AccountType.SEARCH_ACCOUNT_REQUEST, searchAccountSaga);
  yield takeLatest(AccountType.GET_LIST_ACCOUNT_REQUEST, listAccountSaga);
  yield takeLatest(AccountType.GET_LIST_DEPARTMENT_REQUEST, listDepartmentSaga);
  yield takeLatest(AccountType.GET_LIST_POSITION_REQUEST, listPositionSaga);
}
