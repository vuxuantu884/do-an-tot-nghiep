import { getSources } from './../../../service/order/order.service';
import { SourceResponse } from './../../../model/response/order/source.response';
import { PaymentMethodResponse } from './../../../model/response/order/paymentmethod.response';
import { getPaymentMethod, orderPostApi } from "../../../service/order/order.service";
import { OrderType } from "../../types/order.type";
import BaseResponse from "base/BaseResponse";
import { put, call, takeLatest } from "redux-saga/effects";
import { HttpStatus } from "config/HttpStatus";
import { YodyAction } from "../../../base/BaseAction";
import { showError } from "utils/ToastUtils";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { OrderResponse } from "model/response/order/order-online.response";

function* orderCreateSaga(action: YodyAction) {
  const { request, setData } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<OrderResponse> = yield call(
      orderPostApi,
      request
    );
    yield put(hideLoading());
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    yield put(hideLoading());
    showError(error);
  }
}

function* PaymentMethodGetListSaga(action: YodyAction) {
  let { setData } = action.payload;
  try {
      let response: BaseResponse<Array<PaymentMethodResponse>> = yield call(getPaymentMethod);
      switch (response.code) {
          case HttpStatus.SUCCESS:
              setData(response.data);
              break;
          default:
              break;
      }
  } catch (error) {}
}

function* getDataSource(action: YodyAction) {
  let { setData } = action.payload;
  try {
      let response: BaseResponse<Array<SourceResponse>> = yield call(getSources);
      switch (response.code) {
          case HttpStatus.SUCCESS:
              setData(response.data);
              break;
          default:
              break;
      }
  } catch (error) {}
}


function* OrderOnlineSaga() {
  yield takeLatest(OrderType.CREATE_ORDER_REQUEST, orderCreateSaga);
  yield takeLatest(OrderType.GET_LIST_PAYMENT_METHOD, PaymentMethodGetListSaga);
  yield takeLatest(OrderType.GET_LIST_SOURCE_REQUEST, getDataSource);
}

export default OrderOnlineSaga;
