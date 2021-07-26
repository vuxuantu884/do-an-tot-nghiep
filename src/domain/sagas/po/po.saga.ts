import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { POType } from "domain/types/purchase-order.type";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { call, put, takeLatest } from "redux-saga/effects";
import { createPurchaseOrder } from "service/purchase-order/purchase-order.service";
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

export function* poSaga() {
  yield takeLatest(POType.CREATE_PO_REQUEST, poCreateSaga);
}
