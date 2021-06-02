import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { SupplierType } from "domain/types/core.type";
import { PageResponse } from "model/response/base-metadata.response";
import { SupplierResposne } from "model/response/supplier/supplier.response";
import { call, put, takeLatest } from "redux-saga/effects";
import { getSupplierAPI } from "service/core/supplier.service";
import { showError } from "utils/ToastUtils";

function* searchSupplierSaga(action: YodyAction) {
  const {query, setData} = action.payload;
  try {
    yield put(showLoading());
    debugger;
    let response: BaseResponse<PageResponse<SupplierResposne>> = yield call(getSupplierAPI, query);
    yield put(hideLoading());
    switch(response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    yield put(hideLoading());
    showError('Có lỗi vui lòng thử lại sau');
  }
}

export function* supplierSagas() {
  yield takeLatest(SupplierType.SEARCH_SUPPLIER_REQUEST, searchSupplierSaga);
} 