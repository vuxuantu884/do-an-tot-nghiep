import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { fetchApiErrorAction } from "domain/actions/app.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { SETTING_TYPES } from "domain/types/settings.type";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderSourceResponseModel } from "model/response/order/order-source.response";
import {
	createOrderSourceService,
	deleteOrderSourceService,
	editOrderSourceService,
	getListSourcesCompaniesService,
	getSourcesWithParamsService
} from "service/order/order.service";
import { isFetchApiSuccessful } from "utils/AppUtils";
import { showError, showSuccess } from "utils/ToastUtils";

function* listAllOrderSourceSaga(action: YodyAction) {
  const { queryParams, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<PageResponse<OrderSourceResponseModel>> =
      yield call(getSourcesWithParamsService, queryParams);

		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách nguồn đơn hàng"));
		}
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi khi lấy danh sách nguồn đơn hàng. Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* listAllOrderSourceCompaniesSaga(action: YodyAction) {
  const { handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<PageResponse<OrderSourceResponseModel>> =
      yield call(getListSourcesCompaniesService);

		if (isFetchApiSuccessful(response)) {
			handleData(response.data);
		} else {
			yield put(fetchApiErrorAction(response, "Danh sách phòng ban"));
		}
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi khi lấy danh sách phòng ban. Vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* addOrderSourceSaga(action: YodyAction) {
  const { item, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<PageResponse<OrderSourceResponseModel>> =
      yield call(createOrderSourceService, item);

		if (isFetchApiSuccessful(response)) {
			handleData();
    	showSuccess("Tạo mới thành công!");
		} else {
			yield put(fetchApiErrorAction(response, "Tạo mới nguồn đơn hàng"));
		}
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi khi tạo mới nguồn đơn hàng, vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* editOrderSourceSaga(action: YodyAction) {
  const { id, item, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<PageResponse<OrderSourceResponseModel>> =
      yield call(editOrderSourceService, id, item);
		if (isFetchApiSuccessful(response)) {
			handleData();
			showSuccess("Cập nhật thành công!");
		} else {
			yield put(fetchApiErrorAction(response, "Cập nhật nguồn đơn hàng"));
		}
  } catch (error) {
    console.log("error", error);
    showError("Có lỗi khi sửa nguồn đơn hàng, vui lòng thử lại sau!");
  } finally {
    yield put(hideLoading());
  }
}

function* deleteOrderSourceSaga(action: YodyAction) {
  const { id, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<PageResponse<OrderSourceResponseModel>> =
      yield call(deleteOrderSourceService, id);

		if (isFetchApiSuccessful(response)) {
			handleData();
			showSuccess("Xóa thành công!");
		} else {
			yield put(fetchApiErrorAction(response, "Xóa nguồn đơn hàng"));
		}
  } catch (error) {
    console.log("error", error);
    // showError("Có lỗi vui lòng thử lại sau");
  } finally {
    yield put(hideLoading());
  }
}

export function* settingOrderSourceSaga() {
  yield takeLatest(SETTING_TYPES.orderSources.listData, listAllOrderSourceSaga);
  yield takeLatest(
    SETTING_TYPES.orderSources.listSourceCompany,
    listAllOrderSourceCompaniesSaga
  );
  yield takeLatest(SETTING_TYPES.orderSources.create, addOrderSourceSaga);
  yield takeLatest(SETTING_TYPES.orderSources.edit, editOrderSourceSaga);
  yield takeLatest(SETTING_TYPES.orderSources.delete, deleteOrderSourceSaga);
}
