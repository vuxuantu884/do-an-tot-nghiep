import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { ORDER_RETURN_TYPES } from "domain/types/order-return";
import { OrderActionLogResponse } from "model/response/order/action-log.response";
import { OrderReturnReasonModel } from "model/response/order/order.response";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  createOrderExchangeService,
  createOrderReturnService,
  getOrderReturnCalculateRefund,
  getOrderReturnLog,
  getOrderReturnReasonService,
  getOrderReturnService,
  orderRefundService,
  setIsReceivedProductOrderReturnService,
} from "service/order/return.service";
import { showError, showSuccess } from "utils/ToastUtils";
import { YodyAction } from "../../../base/base.action";
import { unauthorizedAction } from "../../actions/auth/auth.action";
import { OrderType } from "../../types/order.type";

function* getOrderReturnDetailsSaga(action: YodyAction) {
  const { id, handleData } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<any> = yield call(getOrderReturnService, id);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

function* createOrderReturnSaga(action: YodyAction) {
  const { params, handleData } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<any> = yield call(
      createOrderReturnService,
      params
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        showSuccess("Tạo đơn trả hàng thành công!");
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi khi tạo đơn trả hàng! Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* setIsReceivedProductReturnSaga(action: YodyAction) {
  const { id, handleData } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<any> = yield call(
      setIsReceivedProductOrderReturnService,
      id
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        showSuccess("Thay đổi trạng thái đã nhận hàng thành công!");
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
		showError("Có lỗi khi tạo nhận hàng đơn trả hàng! Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* getOrderReturnReasonsSaga(action: YodyAction) {
  const { handleData } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<OrderReturnReasonModel[]> = yield call(
      getOrderReturnReasonService
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
		showError("Có lỗi khi lấy danh sách lý do trả hàng! Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* orderRefundSaga(action: YodyAction) {
  const { id, params, handleData } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<any> = yield call(
      orderRefundService,
      id,
      params
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        showSuccess("Hoàn tiền thành công!");
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
		showError("Có lỗi khi hoàn tiền đơn trả hàng! Vui lòng thử lại sau!");
  }
}

function* createOrderExchangeSaga(action: YodyAction) {
  const { params, handleData, handleError } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<any> = yield call(
      createOrderExchangeService,
      params
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        showSuccess("Tạo đơn đổi hàng thành công!");
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        handleError();
        break;
      default:
        response.errors.forEach((e) => showError(e));
        handleError();
        break;
    }
  } catch (error) {
    console.log("error", error);
    handleError();
    showError("Có lỗi khi tạo đơn đổi hàng! Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* getOrderReturnLogSaga(action: YodyAction) {
  const { id, handleData } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<OrderActionLogResponse[]> = yield call(
      getOrderReturnLog,
      id
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
		showError("Có lỗi khi lấy danh sách bản ghi đơn trả hàng! Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* getOrderReturnCalculateRefundSaga(action: YodyAction) {
  const { customerId, orderId, refund, handleData } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<any> = yield call(
      getOrderReturnCalculateRefund,
      customerId,
      orderId,
      refund
    );

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        break;
    }
  } catch (error) {
    console.log("error", error);
		showError("Có lỗi khi lấy dữ liệu điểm tích lũy! Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

export function* OrderReturnSaga() {
  yield takeLatest(
    OrderType.return.GET_RETURN_DETAIL,
    getOrderReturnDetailsSaga
  );
  yield takeLatest(OrderType.CREATE_RETURN, createOrderReturnSaga);
  yield takeLatest(
    ORDER_RETURN_TYPES.SET_IS_RECEIVED_PRODUCT,
    setIsReceivedProductReturnSaga
  );
  yield takeLatest(
    ORDER_RETURN_TYPES.GET_LIST_RETURN_REASON,
    getOrderReturnReasonsSaga
  );
  yield takeLatest(ORDER_RETURN_TYPES.REFUND, orderRefundSaga);
  yield takeLatest(
    ORDER_RETURN_TYPES.CREATE_ORDER_EXCHANGE,
    createOrderExchangeSaga
  );
  yield takeLatest(
    ORDER_RETURN_TYPES.GET_ORDER_RETURN_LOGS,
    getOrderReturnLogSaga
  );
  yield takeLatest(
    ORDER_RETURN_TYPES.GET_ORDER_RETURN_CALCULATE_REFUND,
    getOrderReturnCalculateRefundSaga
  );
}
