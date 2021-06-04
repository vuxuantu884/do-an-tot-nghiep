import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { SupplierType } from "domain/types/core.type";
import { PageResponse } from "model/response/base-metadata.response";
import { SupplierResponse } from "model/response/supplier/supplier.response";
import { call, put, takeLatest } from "redux-saga/effects";
import { supplierGetApi, supplierPostApi } from "service/core/supplier.service";
import { showError } from "utils/ToastUtils";

function* supplierSearchSaga(action: YodyAction) {
  const {query, setData} = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<PageResponse<SupplierResponse>> = yield call(supplierGetApi, query);
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

function* supplierCreateSaga(action: YodyAction) {
  const {request, setData} = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<SupplierResponse> = yield call(supplierPostApi, request);
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
  yield takeLatest(SupplierType.SEARCH_SUPPLIER_REQUEST, supplierSearchSaga);
  yield takeLatest(SupplierType.CREATE_SUPPLIER_REQUEST, supplierCreateSaga);
} 