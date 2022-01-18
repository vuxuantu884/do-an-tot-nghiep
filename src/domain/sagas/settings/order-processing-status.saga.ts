import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { fetchApiErrorAction } from "domain/actions/app.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { SETTING_TYPES } from "domain/types/settings.type";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderProcessingStatusResponseModel } from "model/response/order-processing-status.response";
import {
	createOrderProcessingStatusService,
	deleteOrderProcessingStatusService,
	editOrderProcessingStatusService,
	getOrderProcessingStatusService
} from "service/order/order-processing-status.service";
import { isFetchApiSuccessful } from "utils/AppUtils";
import { showError, showSuccess } from "utils/ToastUtils";

function* listDataOrderProcessingStatusSaga(action: YodyAction) {
  const { queryParams, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<
      PageResponse<OrderProcessingStatusResponseModel>
    > = yield call(getOrderProcessingStatusService, queryParams);

		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách trạng thái xử lý đơn hàng"));
		}
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi khi lấy danh sách trạng thái xử lý đơn hàng. Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* addOrderProcessingStatusSaga(action: YodyAction) {
  const { item, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<
      PageResponse<OrderProcessingStatusResponseModel>
    > = yield call(createOrderProcessingStatusService, item);

		if (isFetchApiSuccessful(response)) {
			handleData();
      showSuccess("Tạo mới thành công!");
		} else {
			yield put(fetchApiErrorAction(response, "Tạo mới trạng thái xử lý đơn hàng"));
		}
  } catch (error) {
    console.log("error", error);
		showError("Có lỗi khi tạo mới trạng thái xử lý đơn hàng. Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* editOrderProcessingStatusSaga(action: YodyAction) {
  const { id, item, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<
      PageResponse<OrderProcessingStatusResponseModel>
    > = yield call(editOrderProcessingStatusService, id, item);

		if (isFetchApiSuccessful(response)) {
			handleData();
      showSuccess("Cập nhật thành công!");
		} else {
			yield put(fetchApiErrorAction(response, "Cập nhật trạng thái xử lý đơn hàng"));
		}
  } catch (error) {
    console.log("error", error);
		showError("Có lỗi khi cập nhật trạng thái xử lý đơn hàng. Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* deleteOrderProcessingStatusSaga(action: YodyAction) {
  const { id, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<
      PageResponse<OrderProcessingStatusResponseModel>
    > = yield call(deleteOrderProcessingStatusService, id);

		if (isFetchApiSuccessful(response)) {
			handleData();
      showSuccess("Xóa thành công!");
		} else {
			yield put(fetchApiErrorAction(response, "Xóa trạng thái xử lý đơn hàng"));
		}
  } catch (error) {
    console.log("error", error);
		showError("Có lỗi khi xóa trạng thái xử lý đơn hàng. Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

export function* settingOrderProcessingStatusSaga() {
  yield takeLatest(
    SETTING_TYPES.orderProcessingStatus.listData,
    listDataOrderProcessingStatusSaga
  );
  yield takeLatest(
    SETTING_TYPES.orderProcessingStatus.create,
    addOrderProcessingStatusSaga
  );
  yield takeLatest(
    SETTING_TYPES.orderProcessingStatus.edit,
    editOrderProcessingStatusSaga
  );
  yield takeLatest(
    SETTING_TYPES.orderProcessingStatus.delete,
    deleteOrderProcessingStatusSaga
  );
}
