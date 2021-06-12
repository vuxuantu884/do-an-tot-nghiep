import { RoleGetListService } from 'service/auth/role.service';
import { RoleType } from 'domain/types/auth.type';
import { RoleResponse } from 'model/auth/roles.model';
import { call, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { PageResponse } from "model/base/base-metadata.response";

function* RoleGetListSaga(action: YodyAction) {
  let { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<RoleResponse>> = yield call(RoleGetListService,query);
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


export function* accountSaga() {
  yield takeLatest(RoleType.GET_LIST_ROLE_REQUEST, RoleGetListSaga);
}
