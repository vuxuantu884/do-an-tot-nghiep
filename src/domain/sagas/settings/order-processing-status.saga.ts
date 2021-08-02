import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { SETTING_TYPES } from "domain/types/settings.type";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderProcessingStatusResponseModel } from "model/response/order-processing-status.response";
import {
  createOrderProcessingStatusService,
  deleteOrderProcessingStatusService,
  editOrderProcessingStatusService,
  getOrderProcessingStatusService,
} from "service/order/order-processing-status.service";
import { showError, showSuccess } from "utils/ToastUtils";

function* listDataOrderProcessingStatusSaga(action: YodyAction) {
  const { params, handleData } = action.payload;
  try {
    let response: BaseResponse<
      PageResponse<OrderProcessingStatusResponseModel>
    > = yield call(getOrderProcessingStatusService, params);

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

function* addOrderProcessingStatusSaga(action: YodyAction) {
  const { item, handleData } = action.payload;
  try {
    let response: BaseResponse<
      PageResponse<OrderProcessingStatusResponseModel>
    > = yield call(createOrderProcessingStatusService, item);

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

function* editOrderProcessingStatusSaga(action: YodyAction) {
  const { id, item, handleData } = action.payload;
  console.log("item", item);
  try {
    let response: BaseResponse<
      PageResponse<OrderProcessingStatusResponseModel>
    > = yield call(editOrderProcessingStatusService, id, item);

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

function* deleteOrderProcessingStatusSaga(action: YodyAction) {
  const { id, handleData } = action.payload;
  try {
    let response: BaseResponse<
      PageResponse<OrderProcessingStatusResponseModel>
    > = yield call(deleteOrderProcessingStatusService, id);

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
