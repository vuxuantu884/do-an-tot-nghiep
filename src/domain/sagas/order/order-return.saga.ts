import BaseResponse from "base/base.response";
import { fetchApiErrorAction } from "domain/actions/app.action";
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
	setIsReceivedProductOrderReturnService
} from "service/order/return.service";
import { isFetchApiSuccessful } from "utils/AppUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { YodyAction } from "../../../base/base.action";
import { OrderType } from "../../types/order.type";

function* getOrderReturnDetailsSaga(action: YodyAction) {
  const { id, handleData } = action.payload;
  try {
    yield put(showLoading());
    let response: BaseResponse<any> = yield call(getOrderReturnService, id);
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Chi tiết đơn hàng đổi trả"));
		}
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi khi lấy chi tiết đơn hàng đổi trả. Vui lòng thử lại sau!");
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
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
      showSuccess("Tạo đơn trả hàng thành công!");
		} else {
			yield put(fetchApiErrorAction(response, "Tạo đơn trả hàng"));
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
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
      showSuccess("Thay đổi trạng thái đã nhận hàng thành công!");
		} else {
			yield put(fetchApiErrorAction(response, "Thay đổi trạng thái đã nhận hàng"));
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
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách lý do trả hàng"));
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
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Hoàn tiền đơn trả hàng"));
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
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
      showSuccess("Tạo đơn đổi hàng thành công!");
		} else {
			handleError();
			yield put(fetchApiErrorAction(response, "Tạo đơn đổi hàng"));
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
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách bản ghi đơn trả hàng"));
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
		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Dữ liệu điểm tích lũy"));
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
