import { POType } from 'domain/types/purchase-order.type';
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  ActionLogDetailResponse,
  PurchaseOrderActionLogResponse,
} from "model/response/po/action-log.response";
import { call, put, takeLatest } from "redux-saga/effects";
import {
  getPOActionLogService,
  getPOActionLogDetailService,
} from "service/purchase-order/action-log.service";
import { showError } from "utils/ToastUtils";
import { YodyAction } from "../../../base/base.action";
import { unauthorizedAction } from "../../actions/auth/auth.action";

function* getPOActionLogsSaga(action: YodyAction) {
  const { id, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<PurchaseOrderActionLogResponse[]> = yield call(
      getPOActionLogService,
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
		showError("Có lỗi khi lấy danh sách bản ghi đơn nhập hàng! Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* getPOActionLogDetailsSaga(action: YodyAction) {
  const { id, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<ActionLogDetailResponse> = yield call(
      getPOActionLogDetailService,
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
    console.log(
      'log', error
    )
		showError("Có lỗi khi lấy thông tin chi tiết bản ghi đơn nhập hàng! Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

export function* PurchaseOrderActionLogSaga() {
  yield takeLatest(POType.GET_PURCHASE_ORDER_ACTION_LOGS, getPOActionLogsSaga);
  yield takeLatest(POType.GET_ACTION_LOG_DETAILS, getPOActionLogDetailsSaga);
}
