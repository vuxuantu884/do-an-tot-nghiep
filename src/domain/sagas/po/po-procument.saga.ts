import { createPurchaseProcumentService } from 'service/purchase-order/purchase-procument.service';
import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { call, put, takeLatest } from "redux-saga/effects";
import { showError } from "utils/ToastUtils";
import { updatePurchasePaymentService } from "service/purchase-order/purchase-payment.service";
import { POProcumentType } from "domain/types/purchase-order.type";

function* poProcumentCreateSaga(action: YodyAction) {
  const { poId, request, createCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchasePayments>> = yield call(
      createPurchaseProcumentService,
      poId,
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

function* poProcumentUpdateSaga(action: YodyAction) {
  const { poId, paymentId, request, updateCallback } = action.payload;
  try {
    let response: BaseResponse<BaseResponse<PurchasePayments>> = yield call(
      updatePurchasePaymentService,
      poId,
      paymentId,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        console.log(response.data);
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

export function* poProcumentSaga() {
  yield takeLatest(POProcumentType.CREATE_PO_PROCUMENT_REQUEST, poProcumentCreateSaga);
  yield takeLatest(POProcumentType.UPDATE_PO_PROCUMENT_REQUEST, poProcumentUpdateSaga);
}
