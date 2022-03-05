import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { PaymentConditionsType } from "domain/types/purchase-order.type";
import { call, put, takeLatest } from "redux-saga/effects";
import { showError } from "utils/ToastUtils";
import { getPaymentConditionsrApi } from "service/purchase-order/payment-conditions.service";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";

function* paymentConditionsGetAll(action: YodyAction) {
  const { setData } = action.payload;
  try {

    let response: BaseResponse<Array<PoPaymentConditions>> = yield call(
      getPaymentConditionsrApi
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
    // showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* paymentConditionsSaga() {
  yield takeLatest(
    PaymentConditionsType.GET_PAYMENT_CONDITIONS_REQUEST,
    paymentConditionsGetAll
  );
}
