import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { SETTING_TYPES } from "domain/types/settings.type";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderSourceResponseModel } from "model/response/order/order-source.response";
import {
  createOrderSourceService,
  deleteOrderSourceService,
  editOrderSourceService,
  getListSourcesCompaniesService,
  getSourcesWithParamsService,
} from "service/order/order.service";
import { showError, showSuccess } from "utils/ToastUtils";

function* listAllOrderSourceSaga(action: YodyAction) {
  const { queryParams, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<PageResponse<OrderSourceResponseModel>> =
      yield call(getSourcesWithParamsService, queryParams);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        /**
         * call function handleData in payload, variables are taken from the response -> use when dispatch
         */
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

function* listAllOrderSourceCompaniesSaga(action: YodyAction) {
  const { handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<PageResponse<OrderSourceResponseModel>> =
      yield call(getListSourcesCompaniesService);

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

function* addOrderSourceSaga(action: YodyAction) {
  const { item, handleData } = action.payload;
  yield put(showLoading());
  try {
    let response: BaseResponse<PageResponse<OrderSourceResponseModel>> =
      yield call(createOrderSourceService, item);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData();
        showSuccess("Tạo mới thành công!");
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

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData();
        showSuccess("Cập nhật thành công!");
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

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData();
        showSuccess("Xóa thành công");
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
