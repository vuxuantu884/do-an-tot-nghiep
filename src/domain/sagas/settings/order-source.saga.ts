import { call, put, takeLatest } from "@redux-saga/core/effects";
import { YodyAction } from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { HttpStatus } from "config/HttpStatus";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { SETTING_TYPES } from "domain/types/settings.type";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderProcessingStatusResponseModel } from "model/response/order-processing-status.response";
import {
  OrderSourceModel,
  OrderSourceModelResponse,
} from "model/response/order/order-source.response";
import {
  getListSourcesCompanies,
  getSourcesWithParams,
} from "service/order/order.service";
import { showError, showSuccess } from "utils/ToastUtils";

function* listAllOrderSourceSaga(action: YodyAction) {
  console.log("action", action);
  const { params, handleData } = action.payload;
  try {
    let response: BaseResponse<PageResponse<OrderSourceModelResponse>> =
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
    let response: BaseResponse<PageResponse<OrderSourceModel>> = yield call(
      getListSourcesCompanies
    );
    console.log("response", response);

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

function* addOrderSource(action: YodyAction) {
  const { newItem, handleData } = action.payload;
  try {
    let response: BaseResponse<
      PageResponse<OrderProcessingStatusResponseModel>
    > = yield call(getListSourcesCompanies);

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

export function* settingOrderSourceSaga() {
  yield takeLatest(SETTING_TYPES.orderSources.listData, listAllOrderSourceSaga);
  yield takeLatest(
    SETTING_TYPES.orderSources.listSourceCompany,
    listAllOrderSourceCompaniesSaga
  );
  yield takeLatest(SETTING_TYPES.orderSources.add, addOrderSource);
}
