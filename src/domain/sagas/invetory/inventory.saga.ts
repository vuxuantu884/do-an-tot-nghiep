import { YodyAction } from "base/base.action";
import BaseResponse from "base/base.response";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { InventoryType } from "domain/types/inventory.type";
import { PageResponse } from "model/base/base-metadata.response";
import { AllInventoryResponse, HistoryInventoryResponse } from "model/inventory";
import { call, put, takeLatest } from "redux-saga/effects";
import { inventoryGetApi, inventoryGetDetailApi, inventoryGetHistoryApi } from "service/inventory";
import { showError } from "utils/ToastUtils";

function* inventoryGetSaga(action: YodyAction) {
  let { query, onResult } = action.payload;
  try {
    const response: BaseResponse<PageResponse<AllInventoryResponse>> = yield call(
      inventoryGetApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        onResult(false);
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* inventoryGetDetailSaga(action: YodyAction) {
  let { query, onResult } = action.payload;
  try {
    const response: BaseResponse<PageResponse<AllInventoryResponse>> = yield call(
      inventoryGetDetailApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        onResult(false);
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

function* inventoryGetHistorySaga(action: YodyAction) {
  let { query, onResult } = action.payload;
  try {
    const response: BaseResponse<PageResponse<HistoryInventoryResponse>> = yield call(
      inventoryGetHistoryApi,
      query
    );
    switch (response.code) {
      case HttpStatus.SUCCESS:
        onResult(response.data);
        break;
      case HttpStatus.UNAUTHORIZED:
        yield put(unauthorizedAction());
        break;
      default:
        response.errors.forEach((e) => showError(e));
        onResult(false);
        break;
    }
  } catch (error) {
    onResult(false);
    showError("Có lỗi vui lòng thử lại sau");
  }
}

export function* inventorySaga() {
  yield takeLatest(InventoryType.GET, inventoryGetSaga);
  yield takeLatest(InventoryType.GET_DETAIL, inventoryGetDetailSaga);
  yield takeLatest(InventoryType.GET_HISTORY, inventoryGetHistorySaga);
}
