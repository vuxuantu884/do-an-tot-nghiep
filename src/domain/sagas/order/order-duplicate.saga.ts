import {OrderModel} from "model/order/order.model";
import {CustomerDuplicateModel} from "./../../../model/order/duplicate.model";
import {OrderType} from "domain/types/order.type";
import {
  getDetailOrderDuplicateService,
  getOrderDuplicateService,
  putOrderCancelService,
  putOrderMergeService,
} from "./../../../service/order/order-duplicate.service";
import {call, takeLatest, put} from "@redux-saga/core/effects";
import {YodyAction} from "base/base.action";
import {showError} from "utils/ToastUtils";
import BaseResponse from "base/base.response";
import {HttpStatus} from "config/http-status.config";
import {PageResponse} from "model/base/base-metadata.response";
import {unauthorizedAction} from "./../../actions/auth/auth.action";

function* getOrderDuplicateSaga(action: YodyAction) {
  let {param, setData} = action.payload;
  try {
    let response: BaseResponse<PageResponse<CustomerDuplicateModel>> = yield call(
      getOrderDuplicateService,
      param
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
  } catch {
    showError("Có lỗi khi lấy dữ liệu khach hàng có đơn trùng! Vui lòng thử lại sau!");
  }
}

function* putOrderDuplicateMergeSaga(action: YodyAction) {
  let {origin_id, ids, setData} = action.payload;
  try {
    let response: BaseResponse<OrderModel> = yield call(putOrderMergeService, origin_id, ids);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        setData(null);
        yield put(unauthorizedAction());
        break;
      default:
        setData(null);
        response.errors.forEach((e: any) => showError(e));
        break;
    }
  } catch {
    showError("Có lỗi xảy ra khi thực hiện thao tác gộp đơn trùng");
  }
}

function* putOrderDuplicateCancelSaga(action: YodyAction) {
  let {ids, setData} = action.payload;
  try {
    let response: BaseResponse<any> = yield call(putOrderCancelService, ids);
    switch (response.code) {
      case HttpStatus.SUCCESS:
        setData(true);
        break;
      case HttpStatus.UNAUTHORIZED:
        setData(false);
        yield put(unauthorizedAction());
        break;
      default:
        setData(false);
        response.errors.forEach((e: any) => showError(e));
        break;
    }
  } catch {
    showError("Có lỗi xảy ra khi thực hiện thao tác hủy đơn trùng");
  }
}

function* getDetailOrderDuplicateSaga(action: YodyAction) {
  let {query, setData} = action.payload;
  try {
    let response: BaseResponse<Array<OrderModel>> = yield call(
      getDetailOrderDuplicateService,
      query
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
    showError("Có lỗi khi lấy dữ liệu danh sách đơn hàng! Vui lòng thử lại sau!");
  }
}

export function* OrderDuplicateSaga() {
  yield takeLatest(OrderType.GET_ORDER_DUPLICATE_LIST, getOrderDuplicateSaga);
  yield takeLatest(OrderType.PUT_ORDER_DUPLICATE_MERGE, putOrderDuplicateMergeSaga);
  yield takeLatest(OrderType.PUT_ORDER_DUPLICATE_CANCEL, putOrderDuplicateCancelSaga);
  yield takeLatest(OrderType.GET_DETAIL_ORDER_DUPLICATE, getDetailOrderDuplicateSaga);
}
