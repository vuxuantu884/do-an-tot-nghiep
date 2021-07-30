import { searchPurchaseOrderApi } from "./../../../service/purchase-order/purchase-order.service";
import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { POType } from "domain/types/purchase-order.type";
import { PageResponse } from "model/base/base-metadata.response";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  createPurchaseOrder,
  getPurchaseOrderApi,
} from "service/purchase-order/purchase-order.service";
import { showError } from "utils/ToastUtils";

function* poCreateSaga(action: YodyAction) {
  const { request, createCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchaseOrder>> = yield call(
      createPurchaseOrder,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response.data);
        createCallback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        createCallback(null);
        yield put(unauthorizedAction());
        break;
      default:
        createCallback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    createCallback(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* poDetailSaga(action: YodyAction) {
  const { id, setData } = action.payload;
  try {
    let response: BaseResponse<PurchaseOrder> = yield call(
      getPurchaseOrderApi,
      id
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
        setData(null);
        // response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error ", error);
    showError("Có lỗi vui lòng thử lại sau");
  }
}
function* poSearchSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  try {
    debugger;
    let response: BaseResponse<PageResponse<PurchaseOrder>> = yield call(
      searchPurchaseOrderApi,
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
    console.log(error);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* poSaga() {
  yield takeLatest(POType.CREATE_PO_REQUEST, poCreateSaga);
  yield takeLatest(POType.DETAIL_PO_REQUEST, poDetailSaga);
  yield takeLatest(POType.SEARCH_PO_REQUEST, poSearchSaga);
}
