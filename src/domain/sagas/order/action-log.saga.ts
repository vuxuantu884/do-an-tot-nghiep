import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  ActionLogDetailResponse,
  OrderActionLogResponse,
} from "model/response/order/action-log.response";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  getActionLogDetailService,
  getOrderActionLogsService,
} from "service/order/action-log.service";
import { showError } from "utils/ToastUtils";
import { YodyAction } from "../../../base/base.action";
import { unauthorizedAction } from "../../actions/auth/auth.action";
import { OrderType } from "../../types/order.type";

function* getOrderActionLogsSaga(action: YodyAction) {
  const { id, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<OrderActionLogResponse[]> = yield call(
      getOrderActionLogsService,
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
		showError("Có lỗi khi lấy danh sách bản ghi đơn hàng! Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* getActionLogDetailsSaga(action: YodyAction) {
  const { id, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<ActionLogDetailResponse> = yield call(
      getActionLogDetailService,
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
		showError("Có lỗi khi lấy thông tin chi tiết bản ghi đơn hàng! Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

export function* OrderActionLogSaga() {
  yield takeLatest(OrderType.GET_ORDER_ACTION_LOGS, getOrderActionLogsSaga);
  yield takeLatest(OrderType.GET_ACTION_LOG_DETAILS, getActionLogDetailsSaga);
}
