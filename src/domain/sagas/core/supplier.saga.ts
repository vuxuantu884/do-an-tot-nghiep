import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { SupplierType } from "domain/types/core.type";
import { PageResponse } from "model/base/base-metadata.response";
import { SupplierResponse } from "model/core/supplier.model";
import { call, put, takeLatest } from "redux-saga/effects";
import {supplierDetailApi, supplierGetApi, supplierPostApi, supplierPutApi} from "service/core/supplier.service";
import { showError } from "utils/ToastUtils";

function* supplierSearchSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<SupplierResponse>> = yield call(
      supplierGetApi,
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
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* supplierGetAllSaga(action: YodyAction) {
  const { setData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<SupplierResponse>> = yield call(
      supplierGetApi
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data.items);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        console.log("supplierGetAllSaga:" + response.errors);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    
    console.log("supplierGetAllSaga:" + error);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* supplierUpdateSaga(action: YodyAction) {
  const { id, request, setData } = action.payload;
  try {

    let response: BaseResponse<SupplierResponse> = yield call(
        supplierPutApi,
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

    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* supplierDetailSaga(action: YodyAction) {
  const { id, setData } = action.payload;
  try {

    let response: BaseResponse<SupplierResponse> = yield call(
        supplierDetailApi,
        id
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setData(false);
        yield put(unauthorizedAction());
        break;
      default:
        setData(false);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    setData(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* supplierCreateSaga(action: YodyAction) {
  const { request, setData } = action.payload;
  try {
    
    let response: BaseResponse<SupplierResponse> = yield call(
      supplierPostApi,
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
    
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* supplierSagas() {
  yield takeLatest(SupplierType.SEARCH_SUPPLIER_REQUEST, supplierSearchSaga);
  yield takeLatest(SupplierType.CREATE_SUPPLIER_REQUEST, supplierCreateSaga);
  yield takeLatest(SupplierType.GET_ALL_SUPPLIER_REQUEST, supplierGetAllSaga);
  yield takeLatest(SupplierType.EDIT_SUPPLIER_REQUEST, supplierUpdateSaga);
  yield takeLatest(SupplierType.DETAIL_SUPPLIER_REQUEST, supplierDetailSaga);
}
