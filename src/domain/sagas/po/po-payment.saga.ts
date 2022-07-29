import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { POPaymentType } from "domain/types/purchase-order.type";
import { call, put, takeLatest } from "redux-saga/effects";
import { showError } from "utils/ToastUtils";
import {
  createPurchasePaymentService,
  updatePurchasePaymentService,
  deletePurchasePaymentService,
} from "service/purchase-order/purchase-payment.service";

function* poPaymentCreateSaga(action: YodyAction) {
  const { poId, request, createCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchasePayments>> = yield call(
      createPurchasePaymentService,
      poId,
      request,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
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

function* poPaymentUpdateSaga(action: YodyAction) {
  const { poId, paymentId, request, updateCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchasePayments>> = yield call(
      updatePurchasePaymentService,
      poId,
      paymentId,
      request,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        updateCallback(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        updateCallback(null);
        yield put(unauthorizedAction());
        break;
      default:
        updateCallback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    updateCallback(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* poPaymentDeleteSaga(action: YodyAction) {
  const { poId, paymentId, updateCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchasePayments>> = yield call(
      deletePurchasePaymentService,
      poId,
      paymentId,
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        updateCallback(response.code);
        break;
      case HttpStatus.UNAUTHORIZED:
        updateCallback(null);
        yield put(unauthorizedAction());
        break;
      default:
        updateCallback(null);
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    updateCallback(null);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* poPaymentSaga() {
  yield takeLatest(POPaymentType.CREATE_PO_PAYMENT_REQUEST, poPaymentCreateSaga);
  yield takeLatest(POPaymentType.UPDATE_PO_PAYMENT_REQUEST, poPaymentUpdateSaga);
  yield takeLatest(POPaymentType.DELETE_PO_PAYMENT_REQUEST, poPaymentDeleteSaga);
}
