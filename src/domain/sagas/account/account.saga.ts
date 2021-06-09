import { call, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { AccountType } from "domain/types/account.type";
import { AccountResponse } from "model/response/accounts/account-detail.response";
import { PageResponse } from "model/response/base-metadata.response";
import { searctAccountApi } from "service/accounts/account.service";

function* searchAccountSaga(action: YodyAction) {
  let {query, setData} = action.payload;
  try {
    let response: BaseResponse<PageResponse<AccountResponse>> = yield call(searctAccountApi, query);
    switch(response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        break;
    }
  } catch (e) {
  }
}


function* listAccountSaga(action: YodyAction) {
  let {query, setData} = action.payload;
  try {
    
    let response: BaseResponse<PageResponse<AccountResponse>> = yield call(searctAccountApi, query);
    switch(response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data.items);
        break;
      default:
        break;
    }
  } catch (e) {
  }
}

export function* accountSaga() {
  yield takeLatest(AccountType.SEARCH_ACCOUNT_REQUEST, searchAccountSaga);
  yield takeLatest(AccountType.GET_LIST_ACCOUNT_REQUEST, listAccountSaga);
}