import { unauthorizedAction } from "./../../actions/auth/auth.action";
import {
  getSources,
  getOrderDetail,
  updateFulFillmentStatus,
  updateShipment,
  updatePayment,
  getDeliverieServices,
} from "./../../../service/order/order.service";
import { SourceResponse } from "./../../../model/response/order/source.response";
import { PaymentMethodResponse } from "./../../../model/response/order/paymentmethod.response";
import {
  getPaymentMethod,
  orderPostApi,
} from "../../../service/order/order.service";
import { OrderType } from "../../types/order.type";
import BaseResponse from "base/BaseResponse";
import { put, call, takeLatest } from "redux-saga/effects";
import { HttpStatus } from "config/HttpStatus";
import { YodyAction } from "../../../base/BaseAction";
import { showError } from "utils/ToastUtils";
import { DeliveryServiceResponse, OrderResponse } from "model/response/order/order.response";
import { getAmountPayment } from "utils/AppUtils";

function* orderCreateSaga(action: YodyAction) {
  const { request, setData } = action.payload;
  try {
    let response: BaseResponse<OrderResponse> = yield call(
      orderPostApi,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError(error);
  }
}

function* updateFulFillmentStatusSaga(action: YodyAction) {
  const { request, setData } = action.payload;
  try {
    let response: BaseResponse<OrderResponse> = yield call(
      updateFulFillmentStatus,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError(error);
  }
}

function* updatePaymentSaga(action: YodyAction) {
  const { request, order_id, setData } = action.payload;
  try {
    let response: BaseResponse<OrderResponse> = yield call(
      updatePayment,
      request,
      order_id
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError(error);
  }
}

function* updateShipmentSaga(action: YodyAction) {
  const { request, setData } = action.payload;
  try {
    let response: BaseResponse<OrderResponse> = yield call(
      updateShipment,
      request
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    showError(error);
  }
}

function* PaymentMethodGetListSaga(action: YodyAction) {
  let { setData } = action.payload;
  try {
    let response: BaseResponse<Array<PaymentMethodResponse>> = yield call(
      getPaymentMethod
    );
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

function* orderDetailSaga(action: YodyAction) {
  const { id, setData } = action.payload;
  try {
    let response: BaseResponse<OrderResponse> = yield call(getOrderDetail, id);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        response.data.total_paid = getAmountPayment(response.data.payments);
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

function* ListDeliveryServicesSaga(action: YodyAction) {
  let { setData } = action.payload;
  try {
    let response: BaseResponse<Array<DeliveryServiceResponse>> = yield call(
      getDeliverieServices
    );
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
  yield takeLatest(OrderType.GET_ORDER_DETAIL_REQUEST, orderDetailSaga);
  yield takeLatest(
    OrderType.UPDATE_FULFILLMENT_METHOD,
    updateFulFillmentStatusSaga
  );
  yield takeLatest(OrderType.UPDATE_SHIPPING_METHOD, updateShipmentSaga);
  yield takeLatest(
    OrderType.GET_LIST_DELIVERY_SERVICE,
    ListDeliveryServicesSaga
  );
  yield takeLatest(OrderType.UPDATE_PAYMENT_METHOD, updatePaymentSaga);
}

export default OrderOnlineSaga;
