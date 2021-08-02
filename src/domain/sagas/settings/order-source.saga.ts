import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { SETTING_TYPES } from "domain/types/settings.type";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderSourceResponseModel } from "model/response/order/order-source.response";
import {
  createOrderSourceService,
  deleteOrderSourceService,
  editOrderSourceService,
  getListSourcesCompanies,
  getSourcesWithParams,
} from "service/order/order.service";
import { showError, showSuccess } from "utils/ToastUtils";

function* listAllOrderSourceSaga(action: YodyAction) {
  const { params, handleData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<OrderSourceResponseModel>> =
      yield call(getSourcesWithParams, params);

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
  }
}

function* listAllOrderSourceCompaniesSaga(action: YodyAction) {
  const { handleData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<OrderSourceResponseModel>> =
      yield call(getListSourcesCompanies);

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
  }
}

function* addOrderSourceSaga(action: YodyAction) {
  const { item, handleData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<OrderSourceResponseModel>> =
      yield call(createOrderSourceService, item);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData();
        showSuccess("Tạo mới thành công");
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
  }
}

function* editOrderSourceSaga(action: YodyAction) {
  const { id, item, handleData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<OrderSourceResponseModel>> =
      yield call(editOrderSourceService, id, item);

    switch (response.code) {
      case HttpStatus.SUCCESS:
        handleData();
        showSuccess("Cập nhật thành công");
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
  }
}

function* deleteOrderSourceSaga(action: YodyAction) {
  const { id, handleData } = action.payload;
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
