import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { SETTING_TYPES } from "domain/types/settings.type";
import { PageResponse } from "model/base/base-metadata.response";
import { FulfillmentResponseModel } from "model/response/fulfillment.response";
import {
  createOrderServiceSubStatus,
  getOrderServiceSubStatus,
} from "service/order/order.service";
import { showError, showSuccess } from "utils/ToastUtils";

function* listDataFulfillmentSaga(action: YodyAction) {
  const { params, handleData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<FulfillmentResponseModel>> =
      yield call(getOrderServiceSubStatus, params);

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

function* addFulfillmentSaga(action: YodyAction) {
  const { newItem, handleData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<FulfillmentResponseModel>> =
      yield call(createOrderServiceSubStatus, newItem);

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

export function* settingFulfillmentSaga() {
  yield takeLatest(SETTING_TYPES.fulfillment.listData, listDataFulfillmentSaga);
  yield takeLatest(SETTING_TYPES.fulfillment.add, addFulfillmentSaga);
}
