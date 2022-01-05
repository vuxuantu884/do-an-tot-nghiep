import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { fetchApiErrorAction } from "domain/actions/app.action";
import { OrderType } from "domain/types/order.type";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel } from "model/order/order.model";
import { isFetchApiSuccessful } from "utils/AppUtils";
import { showError } from "utils/ToastUtils";
import { CustomerDuplicateModel } from "./../../../model/order/duplicate.model";
import {
	getDetailOrderDuplicateService,
	getOrderDuplicateService,
	putOrderCancelService,
	putOrderMergeService
} from "./../../../service/order/order-duplicate.service";

function* getOrderDuplicateSaga(action: YodyAction) {
  let {param, setData} = action.payload;
  try {
    let response: BaseResponse<PageResponse<CustomerDuplicateModel>> = yield call(
      getOrderDuplicateService,
      param
    );
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách đơn trùng"));
		}
  } catch {
    showError("Có lỗi khi lấy danh sách đơn trùng! Vui lòng thử lại sau!");
  }
}

function* putOrderDuplicateMergeSaga(action: YodyAction) {
  let {origin_id, ids, setData} = action.payload;
  try {
    let response: BaseResponse<OrderModel> = yield call(putOrderMergeService, origin_id, ids);
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			setData(null);
			yield put(fetchApiErrorAction(response, "Gộp đơn trùng"));
		}
  } catch {
    showError("Có lỗi xảy ra khi thực hiện thao tác gộp đơn trùng");
  }
}

function* putOrderDuplicateCancelSaga(action: YodyAction) {
  let {ids, setData} = action.payload;
  try {
    let response: BaseResponse<any> = yield call(putOrderCancelService, ids);
		if (isFetchApiSuccessful(response)) {
			setData(true);
		} else {
			setData(false);
			yield put(fetchApiErrorAction(response, "Hủy đơn trùng"));
		}
  } catch {
		setData(false);
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
		if (isFetchApiSuccessful(response)) {
			setData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách đơn trùng"));
		}
  } catch (error) {
    showError("Có lỗi khi lấy dữ liệu danh sách đơn trùng! Vui lòng thử lại sau!");
  }
}

export function* OrderDuplicateSaga() {
  yield takeLatest(OrderType.GET_ORDER_DUPLICATE_LIST, getOrderDuplicateSaga);
  yield takeLatest(OrderType.PUT_ORDER_DUPLICATE_MERGE, putOrderDuplicateMergeSaga);
  yield takeLatest(OrderType.PUT_ORDER_DUPLICATE_CANCEL, putOrderDuplicateCancelSaga);
  yield takeLatest(OrderType.GET_DETAIL_ORDER_DUPLICATE, getDetailOrderDuplicateSaga);
}
